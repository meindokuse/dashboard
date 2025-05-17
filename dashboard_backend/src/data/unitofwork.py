from abc import ABC, abstractmethod
from src.repositories.alert_repository import AlertRepository
from src.database.database import async_session_maker
from src.repositories.currency_repository import CurrencyRepository
from src.repositories.portfolio_alert_repository import PortfolioAlertRepository
from src.repositories.portfolio_position_repository import PortfolioPositionRepository
from src.repositories.portfolio_repository import PortfolioRepository
from src.repositories.rate_repository import RateRepository
from src.repositories.transaction_repository import TransactionRepository
from src.repositories.user_repository import UserRepository
import logging

logger = logging.getLogger(__name__)


class IUnitOfWork(ABC):
    """
    Абстрактный интерфейс Unit of Work (единицы работы).
    Определяет основные репозитории и методы для управления транзакциями.
    """

    # Репозитории для работы с различными сущностями
    user: UserRepository
    currency: CurrencyRepository
    rate: RateRepository
    portfolio: PortfolioRepository
    portfolio_position: PortfolioPositionRepository
    transaction: TransactionRepository
    alert: AlertRepository
    alert_portfolio: PortfolioAlertRepository

    @abstractmethod
    def __init__(self):
        """Инициализация UoW"""
        ...

    @abstractmethod
    async def __aenter__(self):
        """
        Вход в контекстный менеджер.
        Должен инициализировать все репозитории.
        """
        ...

    @abstractmethod
    async def __aexit__(self, *args):
        """
        Выход из контекстного менеджера.
        Должен гарантировать закрытие сессии и откат несохраненных изменений.
        """
        ...

    @abstractmethod
    async def commit(self):
        """Фиксация всех изменений в базе данных"""
        ...

    @abstractmethod
    async def rollback(self):
        """Откат всех несохраненных изменений"""
        ...


class UnitOfWork(IUnitOfWork):
    """
    Реализация Unit of Work для основного приложения.
    Управляет сессией базы данных и набором репозиториев.
    """

    def __init__(self):
        """Инициализирует фабрику сессий"""
        self.session_factory = async_session_maker

    async def __aenter__(self):
        """
        Открывает новую сессию БД и инициализирует все репозитории.
        Возвращает экземпляр UoW для использования в контексте.
        """
        self.session = self.session_factory()
        self.user = UserRepository(self.session)
        self.currency = CurrencyRepository(self.session)
        self.rate = RateRepository(self.session)
        self.portfolio = PortfolioRepository(self.session)
        self.portfolio_position = PortfolioPositionRepository(self.session)
        self.transaction = TransactionRepository(self.session)
        self.alert = AlertRepository(self.session)
        self.alert_portfolio = PortfolioAlertRepository(self.session)
        logger.info("UoW session opened")
        return self

    async def __aexit__(self, *args):
        """
        Гарантирует откат изменений и закрытие сессии при выходе из контекста.
        Логирует завершение работы UoW.
        """
        logger.info("Closing UoW session")
        await self.rollback()
        await self.session.close()

    async def commit(self):
        """Фиксирует все изменения в текущей транзакции"""
        await self.session.commit()

    async def rollback(self):
        """Откатывает все изменения в текущей транзакции"""
        await self.session.rollback()


class CeleryUnitOfWork(IUnitOfWork):
    """
    Специализированная реализация UoW для задач Celery.
    Отличается явным управлением транзакциями и расширенным логированием.
    """

    def __init__(self):
        """Инициализирует фабрику сессий"""
        self.session_factory = async_session_maker
        self.session = None

    async def __aenter__(self):
        """
        Открывает сессию с явным началом транзакции.
        Инициализирует только необходимые для Celery репозитории.
        """
        self.session = self.session_factory()
        await self.session.begin()  # Явное начало транзакции
        self.currency = CurrencyRepository(self.session)
        self.rate = RateRepository(self.session)
        logger.debug("New database connection with active transaction created")
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """
        Обрабатывает завершение транзакции:
        - При успехе - коммитит изменения
        - При ошибке - откатывает транзакцию
        - В любом случае закрывает сессию
        """
        try:
            if exc_type is None:
                await self.session.commit()
                logger.debug("Transaction committed")
            else:
                await self.session.rollback()
                logger.error(f"Transaction rolled back due to {exc_type}")
        except Exception as e:
            logger.critical(f"Error during transaction finalization: {e}")
            await self.session.rollback()
            raise
        finally:
            await self.session.close()
            logger.debug("Session closed")

    async def commit(self):
        """Фиксирует текущую транзакцию"""
        await self.session.commit()

    async def rollback(self):
        """Откатывает текущую транзакцию"""
        await self.session.rollback()
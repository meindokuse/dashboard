from decimal import Decimal
from datetime import datetime
from collections import defaultdict

from src.schemas.portfolio import PortfolioPositionRead
from src.schemas.transaction import TransactionRead


class PortfolioCalculator:
    @classmethod
    def calculate_profit(
            cls,
            positions: list["PortfolioPositionRead"],
            transactions: list["TransactionRead"],
            current_rates: dict[str, Decimal]
    ) -> dict[str, dict]:
        """
        Возвращает расчет прибыли для каждой валюты в портфеле.

        :param positions: Список позиций из БД
        :param transactions: Список всех транзакций
        :param current_rates: Текущие курсы валют (например: {"BTC": Decimal("4200000.00")})
        :return: {
            "BTC": {
                "total_amount": Decimal("1.5"),
                "total_cost": Decimal("6000000.00"),
                "current_value": Decimal("6300000.00"),
                "profit": Decimal("300000.00"),
                "profit_percent": Decimal("5.00")
            },
            ...
        }
        """
        result = defaultdict(lambda: {
            "total_amount": Decimal("0"),
            "total_cost": Decimal("0"),
            "current_value": Decimal("0"),
            "profit": Decimal("0"),
            "profit_percent": Decimal("0")
        })

        tx_by_currency = defaultdict(list)
        for tx in sorted(transactions, key=lambda x: x.timestamp):
            tx_by_currency[tx.currency.symbol].append(tx)

        for pos in positions:
            symbol = pos.currency.symbol
            current_rate = current_rates.get(symbol, Decimal("0"))

            fifo_result = cls._calculate_fifo(
                tx_by_currency[symbol],
                pos.amount
            )

            result[symbol]["total_amount"] += pos.amount
            result[symbol]["total_cost"] += fifo_result["total_cost"]
            result[symbol]["current_value"] += pos.amount * current_rate
            result[symbol]["profit"] = (
                    result[symbol]["current_value"] - result[symbol]["total_cost"]
            )
            result[symbol]["profit_percent"] = (
                (result[symbol]["profit"] / result[symbol]["total_cost"] * 100
                 if result[symbol]["total_cost"] > 0 else Decimal("0"))
            )

        return dict(result)

    @classmethod
    def _calculate_fifo(
            cls,
            transactions: list["TransactionRead"],
            remaining_amount: Decimal
    ) -> dict:
        """Реализация FIFO-метода для расчета себестоимости."""
        total_cost = Decimal("0")
        amount_to_process = remaining_amount

        for tx in transactions:
            if amount_to_process <= 0:
                break

            if tx.type == "buy":
                used_amount = min(tx.amount, amount_to_process)
                total_cost += used_amount * tx.rate
                amount_to_process -= used_amount

        return {
            "total_cost": total_cost,
            "used_amount": remaining_amount - amount_to_process
        }

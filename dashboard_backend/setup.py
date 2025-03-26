from setuptools import setup, find_packages

setup(
    name="backend",
    version="1.0",
    packages=find_packages(),  # Ищет все пакеты в dashboard_backend
    install_requires=[
        "fastapi",
        "uvicorn",
    ],
)
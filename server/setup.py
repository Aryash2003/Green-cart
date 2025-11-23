from setuptools import setup, find_packages
from pathlib import Path

here = Path(__file__).parent
requirements = []
req_file = here / 'requirements.txt'
if req_file.exists():
    requirements = [r.strip() for r in req_file.read_text().splitlines() if r.strip() and not r.strip().startswith('#')]

setup(
    name='green_cart_server',
    version='0.1.0',
    description='Backend server for Green Cart application',
    packages=find_packages(exclude=('tests', 'venv')),
    include_package_data=True,
    install_requires=requirements,
    entry_points={
        'console_scripts': [
            'green-cart-server = main:app',
        ],
    },
)

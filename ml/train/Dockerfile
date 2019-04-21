FROM python:3

RUN pip3 install numpy
RUN pip3 install scipy
RUN pip3 install pandas requests scikit-learn

COPY    11457_new.csv 11457_new.csv
COPY    11065_new.csv 11065_new.csv
COPY    train.py train.py

EXPOSE 8000
ENTRYPOINT ["python", "train.py"]

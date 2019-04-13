FROM python:3

RUN pip3 install numpy
RUN pip3 install scipy
RUN pip3 install pandas requests scikit-learn

COPY    train.py train.py

EXPOSE 8000
ENTRYPOINT ["python", "train.py"]

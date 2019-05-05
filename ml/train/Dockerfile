FROM python:3

RUN pip3 install numpy
RUN pip3 install scipy
RUN pip3 install pandas requests scikit-learn
RUN pip3 install azure-storage-blob
RUN pip3 install azure.cosmos
COPY    model.pkl.bz model.pkl.bz
COPY    cosmos_reader.py cosmos_reader.py
COPY    train.py train.py
ENV PYTHONUNBUFFERED=0

EXPOSE 8000
ENTRYPOINT ["python", "-u", "train.py"]

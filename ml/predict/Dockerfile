FROM python:3

RUN pip3 install scipy
RUN pip3 install pandas requests scikit-learn
RUN pip3 install numpy
RUN pip3 install azure-storage-blob
COPY    predict.py predict.py
COPY    model.pkl.bz model.pkl.bz
ENV PYTHONUNBUFFERED=0
EXPOSE 8080
ENTRYPOINT ["python", "-u", "predict.py"]

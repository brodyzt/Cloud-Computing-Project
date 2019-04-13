FROM python:3

RUN pip3 install numpy
RUN pip3 install scipy
RUN pip3 install requests scikit-learn

COPY    predict.py predict.py

EXPOSE 8080
ENTRYPOINT ["python", "predict.py"]

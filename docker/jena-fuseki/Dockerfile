FROM openjdk:11.0.5-jdk-slim-buster

WORKDIR /tmp

ENV JENA_PACKAGE_NAME    apache-jena-fuseki-4.5.0
ENV JENA_FUSEKI_INSTALL  /jena-fuseki
ENV JENA_FUSEKI_DATA     /jena-fuseki-data

ENV FUSEKI_HOME         ${JENA_FUSEKI_INSTALL}/${JENA_PACKAGE_NAME}
ENV FUSEKI_SERVER       ${FUSEKI_HOME}/fuseki-server

ADD ${JENA_PACKAGE_NAME}.tar.gz ${JENA_FUSEKI_INSTALL}
RUN cd ${FUSEKI_HOME} && chmod 755 fuseki-server

RUN echo "==== Docker build for ${JENA_PACKAGE_NAME} ====" && echo

COPY entrypoint.sh /
RUN chmod 755 /entrypoint.sh

WORKDIR $FUSEKI_HOME

EXPOSE 3030
ENTRYPOINT ["/entrypoint.sh"]
CMD [${FUSEKI_SERVER}]
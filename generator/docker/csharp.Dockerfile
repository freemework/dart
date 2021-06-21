FROM mcr.microsoft.com/dotnet/sdk:5.0.103
RUN apt-get update && apt-get install -y ruby-mustache && rm -rf /var/lib/apt/lists/*
COPY generator/docker/docker-entrypoint.sh /usr/local/bin/
WORKDIR /build
ENTRYPOINT [ "/usr/local/bin/docker-entrypoint.sh" ]
CMD [ "csharp" ]
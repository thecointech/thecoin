# TapCapSupplier.Server - ASP.NET Core 2.0 Server

The interace for TapCap between buyers & sellers.

## Run

Linux/OS X:

```
sh build.sh
```

Windows:

```
build.bat
```

## Run in Docker

```
cd Server/TapCapSupplier.Server
docker build -t tapcapsupplier.server .
docker run -p 5000:5000 tapcapsupplier.server
```

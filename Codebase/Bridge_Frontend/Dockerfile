FROM node:latest

RUN mkdir /src
WORKDIR /src

RUN git clone https://github.com/Perpetual-Altruism-Ltd/myNFT-Bridge.git .

WORKDIR /src/Codebase/Bridge_Frontend

RUN yarn
CMD yarn start
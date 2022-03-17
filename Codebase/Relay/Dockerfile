FROM node:16

RUN mkdir /src
WORKDIR /src

RUN git clone https://github.com/Perpetual-Altruism-Ltd/myNFT-Bridge.git .

WORKDIR /src/Codebase/Relay
RUN yarn

CMD node main.js
import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "../../types/nextSocketResponse";
import { Server as ServerIO } from "socket.io";
import { Server as NetServer } from "http";
import Base64 from 'crypto-js/enc-base64';
import HmacSHA256 from 'crypto-js/hmac-sha256';

export const config = {
  api: {
    bodyParser: false,
  },
};

const socketIO = async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log("New Socket.io server...");
    // adapt Next's net Server to http Server
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: "/api/socketio",
    });

    callPtx(io);
    setInterval(() => callPtx(io), 10000);
    // append SocketIO server to Next.js socket server response
    res.socket.server.io = io;
  }
  res.end();
};

const callPtx = async (io: any) => {
    const today = new Date().toUTCString();
    const signature = Base64.stringify(HmacSHA256("x-date: " + today, '3gd2NwVIqIrNUvI2lEtzRpAiKd4'));
    const apiRes = await fetch('http://ptx.transportdata.tw/MOTC/v2/Bus/RealTimeByFrequency/City/Taipei?$orderby=PlateNumb&$format=JSON',
    {
        headers: {
            'Pragma': 'no-cache',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.167 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Cache-Control': 'no-cache',
            'x-date': today,
            'Authorization': `hmac username="b17babe65ca4418680e115cbc5e2e3ad", algorithm="hmac-sha256", headers="x-date", signature="${signature}"`
        },
    });
    const data = await apiRes.json();
    // console.log(data);
    io.emit('message', data);
}

export default socketIO;
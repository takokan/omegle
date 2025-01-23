import { WebSocket } from "ws";
import { v4 as uuidv4 } from 'uuid';

interface User {
    id: string,
    ws: WebSocket,
    name: string
}

interface Room {
    id: string,
    users: User[]
}

export class UserManager {
    private users: Map<string, User>;
    private rooms: Map<string, Room>;
    private queue: WebSocket[];

    constructor() {
        this.users = new Map();
        this.queue = [];
        this.rooms = new Map();
    }

    addUser(name: string, ws: WebSocket){
        const userId = uuidv4();
        const user: User = { id: userId, name, ws };
        
        this.users.set(userId, user);
        this.queue.push(ws);

        this.createRoom();
        return userId;
    }

    removeUser(userId: string){
        const user = this.users.get(userId);
        if(!user) return;

        this.users.delete(userId);
        this.queue = this.queue.filter(ws => ws !== user.ws);

        this.closeUserRoom(userId);
    }

    private createRoom(){
        if(this.queue.length < 2) return;

        const roomId = uuidv4();
        const roomUsers: User[] = [];

        for(let i = 0; i < 2; i++){
            const ws = this.queue.shift();
            if(!ws) break;

            const user = Array.from(this.users.values()).find(user => user.ws === ws);
            if(user){
                roomUsers.push(user);

                user.ws.send(JSON.stringify({
                    type: 'room-created',
                    roomId: roomId,
                    partnerId: roomUsers.length === 2 ? roomUsers[0].id : null,
                }));
            }
        }

        if(roomUsers.length === 2) {
            this.rooms.set(roomId, { id: roomId, users: roomUsers });

            roomUsers.forEach(user => {
                user.ws.send(JSON.stringify({
                    type: 'room-joined',
                    roomId: roomId,
                    partnerId: roomUsers.find(u => u !== user)?.id,
                    partnerName: roomUsers.find(u => u !== user)?.name
                }));
            });
        }
    }

    private closeUserRoom(userId: string){
        const user = this.users.get(userId);
        if(!user) return;

        const room = Array.from(this.rooms.values()).find(room => room.users.find(u => u.id === userId));
        if(!room) return;

        room.users.forEach(u => {
            if(u.id !== userId){
                u.ws.send(JSON.stringify({
                    type: 'room-closed'
                }));
            }
        });

        this.rooms.delete(room.id);
    }

    private getRoom(userId: string): Room | null {
        for(const room of this.rooms.values()){
            if(room.users.find(u => u.id === userId)){
                return room;
            }
        }

        return null;
    }

}
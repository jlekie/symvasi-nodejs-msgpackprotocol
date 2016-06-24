import MsgPack from 'msgpack-lite';
import { ReadableStreamBuffer, WritableStreamBuffer } from 'stream-buffers';
import Deasync from 'deasync';

import { ErrorHeader } from 'symvasi-runtime';

export class MsgPackProtocol {
    constructor(transport) {
        this.transport = transport;
    }
    
    read() {
        let data;
        Deasync.loopWhile(() => {
            data = this._data.shift();
            return !data;
        });
        
        return data;
    }
    
    beginWrite() {
        this.writeStream = new WritableStreamBuffer();
        this.encoderStream = MsgPack.createEncodeStream();
        
        this.encoderStream.pipe(this.writeStream);
    }
    endWrite() {
        this.encoderStream.end();
        
        this.transport.send(this.writeStream.getContents());
        
        this.writeStream = null;
        this.encoderStream = null;
    }
    
    beginRead() {
        let data = this.transport.receive();
        
        this.readStream = new ReadableStreamBuffer();
        this.readStream.put(data);
        this.readStream.stop();
        
        this.decoderStream = MsgPack.createDecodeStream();
        
        this._data = [];
        this.readStream.pipe(this.decoderStream).on('data', (data) => {
            this._data.push(data);
        });
    }
    async beginReadAsync() {
        let data = await this.transport.receiveAsync();
        
        this.readStream = new ReadableStreamBuffer();
        this.readStream.put(data);
        this.readStream.stop();
        
        this.decoderStream = MsgPack.createDecodeStream();
        
        this._data = [];
        this.readStream.pipe(this.decoderStream).on('data', (data) => {
            this._data.push(data);
        });
    }
    endRead() {
        this.readStream = null;
        this.decoderStream = null;
    }
    
    writeRequestStart(methodName) {
        this.beginWrite();
        
        this.writeString('req');
        this.writeObject({ method: methodName });
    }
    writeRequestEnd() {
        this.writeString('/req');
        
        this.endWrite();
    }
    
    writeRequestArgumentStart(name) {
        this.writeString('arg');
        this.writeObject({ name: name });
    }
    writeRequestArgumentEnd() {
        this.writeString('/arg');
    }
    
    writeResponseStart(success) {
        this.beginWrite();
        
        this.writeString('res');
        this.writeObject({ isValid: success });
    }
    writeResponseEnd() {
        this.writeString('/res');
        
        this.endWrite();
    }
    
    readRequestStart() {
        this.beginRead();
        
        let data = this.readString();
        
        if (data !== 'req') {
            throw new Error('Invalid message');
        }
        
        return this.readObject();
    }
    async readRequestStartAsync() {
        await this.beginReadAsync();
        
        let data = this.readString();
        
        if (data !== 'req') {
            throw new Error('Invalid message');
        }
        
        return this.readObject();
    }
    readRequestEnd() {
        let data = this.readString();
        
        if (data !== '/req') {
            throw new Error('Invalid message');
        }
        
        this.endRead();
    }
    
    readRequestArgumentStart() {
        let data = this.readString();
        
        if (data !== 'arg') {
            throw new Error('Invalid message');
        }
        
        return this.readObject();
    }
    readRequestArgumentEnd() {
        let data = this.readString();
        
        if (data !== '/arg') {
            throw new Error('Invalid message');
        }
    }
    
    readResponseStart() {
        this.beginRead();
        
        let data = this.readString();
        
        if (data !== 'res') {
            throw new Error('Invalid message');
        }
        
        return this.readObject();
    }
    async readResponseStartAsync() {
        await this.beginReadAsync();
        
        let data = this.readString();
        
        if (data !== 'res') {
            throw new Error('Invalid message');
        }
        
        return this.readObject();
    }
    readResponseEnd() {
        let data = this.readString();
        
        if (data !== '/res') {
            throw new Error('Invalid message');
        }
        
        this.endRead();
    }

    readError() {
        let hash = this.readObject();
        
        return new ErrorHeader(hash);
    }
    
    readModelStart() {
        let data = this.readString();
        
        if (data !== 'model') {
            throw new Error('Invalid message');
        }
        
        return this.readObject();
    }
    readModelEnd() {
        let data = this.readString();
        
        if (data !== '/model') {
            throw new Error('Invalid message');
        }
    }
    
    readModelPropertyStart() {
        let data = this.readString();
        
        if (data !== 'prop') {
            throw new Error('Invalid message');
        }
        
        return this.readObject();
    }
    readModelPropertyEnd() {
        let data = this.readString();
        
        if (data !== '/prop') {
            throw new Error('Invalid message');
        }
    }

    writeError(err) {
        this.writeObject({ message: err.message });
    }
    
    writeModelStart(type, propertyCount) {
        this.writeString('model');
        this.writeObject({ propertyCount: propertyCount });
    }
    writeModelEnd() {
        this.writeString('/model');
    }
    
    writeModelPropertyStart(name, type, isNull) {
        this.writeString('prop');
        this.writeObject({ name: name, isNull: isNull });
    }
    writeModelPropertyEnd() {
        this.writeString('/prop');
    }
    
    writeString(data) {
        this.encoderStream.write(data);
    }
    writeBoolean(data) {
        this.encoderStream.write(data);
    }
    writeInteger(data) {
        this.encoderStream.write(data);
    }
    writeFloat(data) {
        this.encoderStream.write(data);
    }
    writeDouble(data) {
        this.encoderStream.write(data);
    }
    writeEnum(data) {
        this.encoderStream.write(0); // TMP!!!
    }
    writeObject(data) {
        this.encoderStream.write(data);
    }
    
    readString() {
        return this.read();
    }
    readBoolean() {
        return this.read();
    }
    readInteger() {
        return this.read();
    }
    readFloat() {
        return this.read();
    }
    readDouble() {
        return this.read();
    }
    readEnum() {
        return this.read();
    }
    readObject() {
        return this.read();
    }
    
    writeStringValue(data) {
        this.writeString(data);
    }
    writeBooleanValue(data) {
        this.writeString(data);
    }
    writeIntegerValue(data) {
        this.writeString(data);
    }
    writeFloatValue(data) {
        this.writeString(data);
    }
    writeDoubleValue(data) {
        this.writeString(data);
    }
    writeEnumValue(data) {
        this.writeString(data);
    }
    
    readStringValue() {
        return this.readString();
    }
    readBooleanValue() {
        return this.readBoolean();
    }
    readIntegerValue() {
        return this.readInteger();
    }
    readFloatValue() {
        return this.readFloat();
    }
    readDoubleValue() {
        return this.readDouble();
    }
    readEnumValue() {
        return this.readEnum();
    }
}
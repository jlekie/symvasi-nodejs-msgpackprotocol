import MsgPack from 'msgpack-lite';
import { ReadableStreamBuffer, WritableStreamBuffer } from 'stream-buffers';
import Deasync from 'deasync';

// import { ErrorHeader } from 'symvasi-runtime';
import { RequestHeader, ResponseHeader, ArgumentHeader, ModelHeader, PropertyHeader, ListHeader, IndefinateHeader, ErrorHeader } from './headers';

export var HeaderCodes = {
    reqStart: 0,
    reqEnd: 1,

    resStart: 2,
    resEnd: 3,

    reqArgStart: 4,
    reqArgEnd: 5,

    modelStart: 6,
    modelEnd: 7,

    propStart: 8,
    propEnd: 9,

    listStart: 10,
    listEnd: 11,

    indefinateStart: 12,
    indefinateEnd: 13
};

export class MsgPackProtocol {
    constructor(transport) {
        this.transport = transport;
    }
    
    read() {
        let data;
        Deasync.loopWhile(() => {
            data = this._data.shift();
            return data === undefined;
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
    
    writeRequestStart(methodName, argumentCount) {
        this.beginWrite();

        this.writeHeaderCode(HeaderCodes.reqStart);
        this.writeHeader(new RequestHeader({ methodName: methodName, argumentCount: argumentCount }));
    }
    writeRequestEnd() {
        this.writeHeaderCode(HeaderCodes.reqEnd);
        
        this.endWrite();
    }
    
    writeRequestArgumentStart(name) {
        this.writeHeaderCode(HeaderCodes.reqArgStart);
        this.writeHeader(new ArgumentHeader({ name: name }));
    }
    writeRequestArgumentEnd() {
        this.writeHeaderCode(HeaderCodes.reqArgEnd);
    }
    
    writeResponseStart(success) {
        this.beginWrite();
        
        this.writeHeaderCode(HeaderCodes.resStart);
        this.writeObject({ isValid: success });
    }
    writeResponseEnd() {
        this.writeHeaderCode(HeaderCodes.resEnd);
        
        this.endWrite();
    }
    
    readRequestStart() {
        this.beginRead();
        
        let headerCode = this.readHeaderCode();
        if (headerCode !== HeaderCodes.reqStart) {
            throw new Error('Invalid message (reqStart)');
        }
        
        return this.readHeader(RequestHeader);
    }
    async readRequestStartAsync() {
        await this.beginReadAsync();
        
        let headerCode = this.readHeaderCode();
        if (headerCode !== HeaderCodes.reqStart) {
            throw new Error('Invalid message (reqStart)');
        }
        
        return this.readHeader(RequestHeader);
    }
    readRequestEnd() {
        let headerCode = this.readHeaderCode();
        if (headerCode !== HeaderCodes.reqEnd) {
            throw new Error('Invalid message (reqEnd)');
        }
        
        this.endRead();
    }
    
    readRequestArgumentStart() {
        let headerCode = this.readHeaderCode();
        if (headerCode !== HeaderCodes.reqArgStart) {
            throw new Error('Invalid message (reqArgStart)');
        }
        
        return this.readHeader(RequestHeader);
    }
    readRequestArgumentEnd() {
        let headerCode = this.readHeaderCode();
        if (headerCode !== HeaderCodes.reqArgEnd) {
            throw new Error('Invalid message (reqArgEnd)');
        }
    }
    
    readResponseStart() {
        this.beginRead();
        
        let headerCode = this.readHeaderCode();
        if (headerCode !== HeaderCodes.resStart) {
            throw new Error('Invalid message (resStart)');
        }
        
        return this.readHeader(ResponseHeader);
    }
    async readResponseStartAsync() {
        await this.beginReadAsync();
        
        let headerCode = this.readHeaderCode();
        if (headerCode !== HeaderCodes.resStart) {
            throw new Error('Invalid message (resStart)');
        }
        
        return this.readHeader(ResponseHeader);
    }
    readResponseEnd() {
        let headerCode = this.readHeaderCode();
        if (headerCode !== HeaderCodes.resEnd) {
            throw new Error('Invalid message (resEnd)');
        }
        
        this.endRead();
    }

    readError() {
        let hash = this.readObject();
        
        return new ErrorHeader(hash);
    }
    
    readModelStart() {
        let headerCode = this.readHeaderCode();
        if (headerCode !== HeaderCodes.modelStart) {
            throw new Error('Invalid message (modelStart)');
        }
        
        return this.readHeader(ModelHeader);
    }
    readModelEnd() {
        let headerCode = this.readHeaderCode();
        if (headerCode !== HeaderCodes.modelEnd) {
            throw new Error('Invalid message (modelEnd)');
        }
    }
    
    readModelPropertyStart() {
        let headerCode = this.readHeaderCode();
        if (headerCode !== HeaderCodes.propStart) {
            throw new Error('Invalid message (propStart)');
        }
        
        return this.readHeader(PropertyHeader);
    }
    readModelPropertyEnd() {
        let headerCode = this.readHeaderCode();
        if (headerCode !== HeaderCodes.propEnd) {
            throw new Error('Invalid message (propEnd)');
        }
    }

    readListStart() {
        let headerCode = this.readHeaderCode();
        if (headerCode !== HeaderCodes.listStart) {
            throw new Error('Invalid message (listStart)');
        }
        
        return this.readHeader(ListHeader);
    }
    readListEnd() {
        let headerCode = this.readHeaderCode();
        if (headerCode !== HeaderCodes.listEnd) {
            throw new Error('Invalid message (listEnd)');
        }
    }

    readIndefinateStart() {
        let headerCode = this.readHeaderCode();
        if (headerCode !== HeaderCodes.indefinateStart) {
            throw new Error('Invalid message (indefinateStart)');
        }
        
        return this.readHeader(IndefinateHeader);
    }
    readIndefinateEnd() {
        let headerCode = this.readHeaderCode();
        if (headerCode !== HeaderCodes.indefinateEnd) {
            throw new Error('Invalid message (indefinateEnd)');
        }
    }

    writeError(err) {
        this.writeObject({ message: err.message });
    }
    
    writeModelStart(type, propertyCount) {
        this.writeHeaderCode(HeaderCodes.modelStart);
        this.writeHeader(new ModelHeader({ propertyCount: propertyCount }));
    }
    writeModelEnd() {
        this.writeHeaderCode(HeaderCodes.modelEnd);
    }
    
    writeModelPropertyStart(name, type, isNull) {
        this.writeHeaderCode(HeaderCodes.propStart);
        this.writeHeader(new PropertyHeader({ name: name, isNull: isNull }));
    }
    writeModelPropertyEnd() {
        this.writeHeaderCode(HeaderCodes.propEnd);
    }

    writeListStart(itemCount) {
        this.writeHeaderCode(HeaderCodes.listStart);
        this.writeHeader(new ListHeader({ itemCount: itemCount }));
    }
    writeListEnd() {
        this.writeHeaderCode(HeaderCodes.listEnd);
    }

    writeIndefinateStart(type, declaredType) {
        this.writeHeaderCode(HeaderCodes.indefinateStart);
        this.writeHeader(new IndefinateHeader({ type: type, declaredType: declaredType }));
    }
    writeIndefinateEnd() {
        this.writeHeaderCode(HeaderCodes.indefinateEnd);
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
    writeByte(data) {
        this.encoderStream.write(data);
    }
    writeEnum(data) {
        this.encoderStream.write(data);
    }
    writeObject(data) {
        this.encoderStream.write(data);
    }
    writeHeaderCode(code) {
        this.encoderStream.write(code);
    }
    writeHeader(data) {
        data.write(this);
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
    readByte() {
        return this.read();
    }
    readEnum() {
        return this.read();
    }
    readObject() {
        return this.read();
    }
    readHeaderCode() {
        return this.read();
    }
    readHeader(HeaderType) {
        let header = new HeaderType();
        header.read(this);

        return header;
    }
    
    writeStringValue(data) {
        this.writeString(data);
    }
    writeBooleanValue(data) {
        this.writeBoolean(data);
    }
    writeIntegerValue(data) {
        this.writeInteger(data);
    }
    writeFloatValue(data) {
        this.writeFloat(data);
    }
    writeDoubleValue(data) {
        this.writeDouble(data);
    }
    writeByteValue(data) {
        this.writeByte(data);
    }
    writeEnumValue(data) {
        this.writeEnum(data);
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
    readByteValue() {
        return this.readByte();
    }
    readEnumValue() {
        return this.readEnum();
    }
}
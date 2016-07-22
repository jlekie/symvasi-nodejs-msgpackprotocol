import _ from 'lodash';
import * as Symvasi from 'symvasi-runtime';

export class RequestHeader {
    constructor(props = {}) {
        this.methodName = props.methodName;
        this.argumentCount = props.argumentCount;
        this.tags = props.tags;
    }

    read(protocol) {
        this.methodName = protocol.readStringValue();
        this.argumentCount = protocol.readIntegerValue();
        
        let tagsHeader = protocol.readMapStart();
        for (let a = 0; a < tagsHeader.itemCount; a++)
        {
            let key = protocol.readStringValue();
            let value = protocol.readStringValue();

            this.tags[key] = value;
        }
        protocol.readMapEnd();
    }
    write(protocol) {
        protocol.writeStringValue(this.methodName);
        protocol.writeIntegerValue(this.argumentCount);

        protocol.writeMapStart(_.size(this.tags));
        for (let key in this.tags) {
            protocol.writeStringValue(key);
            protocol.writeStringValue(this.tags[key]);
        }
        protocol.writeMapEnd();
    }
}
export class ResponseHeader {
    constructor(props = {}) {
        this.isValid = props.isValid;
    }

    read(protocol) {
        this.isValid = protocol.readBooleanValue();
    }
    write(protocol) {
        protocol.writeBooleanValue(this.isValid);
    }
}
export class ArgumentHeader {
    constructor(props = {}) {
        this.name = props.name;
    }

    read(protocol) {
        this.name = protocol.readStringValue();
    }
    write(protocol) {
        protocol.writeStringValue(this.name);
    }
}
export class ModelHeader {
    constructor(props = {}) {
        this.propertyCount = props.propertyCount;
    }

    read(protocol) {
        this.propertyCount = protocol.readIntegerValue();
    }
    write(protocol) {
        protocol.writeIntegerValue(this.propertyCount);
    }
}
export class PropertyHeader {
    constructor(props = {}) {
        this.name = props.name;
        this.isNull = props.isNull;
    }

    read(protocol) {
        this.name = protocol.readStringValue();
        this.isNull = protocol.readBooleanValue();
    }
    write(protocol) {
        protocol.writeStringValue(this.name);
        protocol.writeBooleanValue(this.isNull);
    }
}
export class ListHeader {
    constructor(props = {}) {
        this.itemCount = props.itemCount;
    }

    read(protocol) {
        this.itemCount = protocol.readIntegerValue();
    }
    write(protocol) {
        protocol.writeIntegerValue(this.itemCount);
    }
}
export class MapHeader {
    constructor(props = {}) {
        this.itemCount = props.itemCount;
    }

    read(protocol) {
        this.itemCount = protocol.readIntegerValue();
    }
    write(protocol) {
        protocol.writeIntegerValue(this.itemCount);
    }
}
export class IndefinateHeader {
    constructor(props = {}) {
        this.type = props.type;
        this.declaredType = props.declaredType;
    }

    read(protocol) {
        this.type = protocol.readEnumValue();

        switch (this.type) {
            case Symvasi.IndefinateTypes.get('enum'):
            case Symvasi.IndefinateTypes.get('model'):
                this.declaredType = protocol.readStringValue();
                break;
        }
    }
    write(protocol) {
        protocol.writeEnumValue(this.type);

        switch (this.type) {
            case Symvasi.IndefinateTypes.get('enum'):
            case Symvasi.IndefinateTypes.get('model'):
                protocol.writeStringValue(this.declaredType);
                break;
        }
    }
}
export class ErrorHeader {
    constructor(props = {}) {
        this.message = props.message;
    }

    read(protocol) {
        this.message = protocol.readStringValue();
    }
    write(protocol) {
        protocol.writeStringValue(this.message);
    }

    createError() {
        return new Error(this.message);
    }
}
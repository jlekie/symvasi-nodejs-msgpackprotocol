export class RequestHeader {
    constructor(props = {}) {
        this.methodName = props.methodName;
        this.argumentCount = props.argumentCount;
    }

    read(protocol) {
        this.methodName = protocol.readStringValue();
        this.argumentCount = protocol.readIntegerValue();
    }
    write(protocol) {
        protocol.writeStringValue(this.methodName);
        protocol.writeIntegerValue(this.argumentCount);
    }
}
export class ResponseHeader {
    constructor(props = {}) {
        this.isValid = props.isValid;
        this.test = props.test;
    }

    read(protocol) {
        this.isValid = protocol.readBooleanValue();
        this.test = protocol.readStringValue();
    }
    write(protocol) {
        protocol.writeBooleanValue(this.isValid);
        protocol.writeStringValue(this.test);
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
export class IndefinateHeader {
    constructor(props = {}) {
        this.type = props.type;
        this.declaredType = props.declaredType;
    }

    read(protocol) {
        this.type = protocol.readEnumValue();
        this.declaredType = protocol.readStringValue();
    }
    write(protocol) {
        protocol.writeEnumValue(this.type);
        protocol.writeStringValue(this.declaredType);
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
}
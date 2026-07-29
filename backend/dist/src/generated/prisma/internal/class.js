"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrismaClientClass = getPrismaClientClass;
const runtime = __importStar(require("@prisma/client/runtime/client"));
const config = {
    "previewFeatures": [],
    "clientVersion": "7.9.1",
    "engineVersion": "e922089b7d7502aff4249d5da3420f6fa55fc6ad",
    "activeProvider": "postgresql",
    "inlineSchema": "// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\ngenerator client {\n  provider     = \"prisma-client\"\n  output       = \"../src/generated/prisma\"\n  moduleFormat = \"cjs\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n}\n\nmodel User {\n  id        String   @id @default(cuid())\n  email     String   @unique\n  name      String?\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\nmodel Contact {\n  id        String   @id @default(cuid())\n  fullName  String\n  email     String\n  subject   String\n  message   String\n  createdAt DateTime @default(now())\n}\n",
    "runtimeDataModel": {
        "models": {},
        "enums": {},
        "types": {}
    },
    "parameterizationSchema": {
        "strings": [],
        "graph": ""
    }
};
config.runtimeDataModel = JSON.parse("{\"models\":{\"User\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Contact\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"fullName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"subject\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"message\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null}},\"enums\":{},\"types\":{}}");
config.parameterizationSchema = {
    strings: JSON.parse("[\"where\",\"User.findUnique\",\"User.findUniqueOrThrow\",\"orderBy\",\"cursor\",\"User.findFirst\",\"User.findFirstOrThrow\",\"User.findMany\",\"data\",\"User.createOne\",\"User.createMany\",\"User.createManyAndReturn\",\"User.updateOne\",\"User.updateMany\",\"User.updateManyAndReturn\",\"create\",\"update\",\"User.upsertOne\",\"User.deleteOne\",\"User.deleteMany\",\"having\",\"_count\",\"_min\",\"_max\",\"User.groupBy\",\"User.aggregate\",\"Contact.findUnique\",\"Contact.findUniqueOrThrow\",\"Contact.findFirst\",\"Contact.findFirstOrThrow\",\"Contact.findMany\",\"Contact.createOne\",\"Contact.createMany\",\"Contact.createManyAndReturn\",\"Contact.updateOne\",\"Contact.updateMany\",\"Contact.updateManyAndReturn\",\"Contact.upsertOne\",\"Contact.deleteOne\",\"Contact.deleteMany\",\"Contact.groupBy\",\"Contact.aggregate\",\"AND\",\"OR\",\"NOT\",\"id\",\"fullName\",\"email\",\"subject\",\"message\",\"createdAt\",\"equals\",\"in\",\"notIn\",\"lt\",\"lte\",\"gt\",\"gte\",\"not\",\"contains\",\"startsWith\",\"endsWith\",\"name\",\"updatedAt\",\"set\"]"),
    graph: "ThEgCCoAAEMAMCsAAAQAECwAAEMAMC0BAAAAAS8BAAAAATJAAD0AIT4BAEQAIT9AAD0AIQEAAAABACABAAAAAQAgCCoAAEMAMCsAAAQAECwAAEMAMC0BADwAIS8BADwAITJAAD0AIT4BAEQAIT9AAD0AIQE-AABKACADAAAABAAgAwAABQAwBAAAAQAgAwAAAAQAIAMAAAUAMAQAAAEAIAMAAAAEACADAAAFADAEAAABACAFLQEAAAABLwEAAAABMkAAAAABPgEAAAABP0AAAAABAQgAAAkAIAUtAQAAAAEvAQAAAAEyQAAAAAE-AQAAAAE_QAAAAAEBCAAACwAwAQgAAAsAMAUtAQBIACEvAQBIACEyQABJACE-AQBOACE_QABJACECAAAAAQAgCAAADgAgBS0BAEgAIS8BAEgAITJAAEkAIT4BAE4AIT9AAEkAIQIAAAAEACAIAAAQACACAAAABAAgCAAAEAAgAwAAAAEAIA8AAAkAIBAAAA4AIAEAAAABACABAAAABAAgBBUAAEsAIBYAAE0AIBcAAEwAID4AAEoAIAgqAAA-ADArAAAXABAsAAA-ADAtAQA0ACEvAQA0ACEyQAA1ACE-AQA_ACE_QAA1ACEDAAAABAAgAwAAFgAwFAAAFwAgAwAAAAQAIAMAAAUAMAQAAAEAIAkqAAA7ADArAAAdABAsAAA7ADAtAQAAAAEuAQA8ACEvAQA8ACEwAQA8ACExAQA8ACEyQAA9ACEBAAAAGgAgAQAAABoAIAkqAAA7ADArAAAdABAsAAA7ADAtAQA8ACEuAQA8ACEvAQA8ACEwAQA8ACExAQA8ACEyQAA9ACEAAwAAAB0AIAMAAB4AMAQAABoAIAMAAAAdACADAAAeADAEAAAaACADAAAAHQAgAwAAHgAwBAAAGgAgBi0BAAAAAS4BAAAAAS8BAAAAATABAAAAATEBAAAAATJAAAAAAQEIAAAiACAGLQEAAAABLgEAAAABLwEAAAABMAEAAAABMQEAAAABMkAAAAABAQgAACQAMAEIAAAkADAGLQEASAAhLgEASAAhLwEASAAhMAEASAAhMQEASAAhMkAASQAhAgAAABoAIAgAACcAIAYtAQBIACEuAQBIACEvAQBIACEwAQBIACExAQBIACEyQABJACECAAAAHQAgCAAAKQAgAgAAAB0AIAgAACkAIAMAAAAaACAPAAAiACAQAAAnACABAAAAGgAgAQAAAB0AIAMVAABFACAWAABHACAXAABGACAJKgAAMwAwKwAAMAAQLAAAMwAwLQEANAAhLgEANAAhLwEANAAhMAEANAAhMQEANAAhMkAANQAhAwAAAB0AIAMAAC8AMBQAADAAIAMAAAAdACADAAAeADAEAAAaACAJKgAAMwAwKwAAMAAQLAAAMwAwLQEANAAhLgEANAAhLwEANAAhMAEANAAhMQEANAAhMkAANQAhDhUAADcAIBYAADoAIBcAADoAIDMBAAAAATQBAAAABDUBAAAABDYBAAAAATcBAAAAATgBAAAAATkBAAAAAToBADkAITsBAAAAATwBAAAAAT0BAAAAAQsVAAA3ACAWAAA4ACAXAAA4ACAzQAAAAAE0QAAAAAQ1QAAAAAQ2QAAAAAE3QAAAAAE4QAAAAAE5QAAAAAE6QAA2ACELFQAANwAgFgAAOAAgFwAAOAAgM0AAAAABNEAAAAAENUAAAAAENkAAAAABN0AAAAABOEAAAAABOUAAAAABOkAANgAhCDMCAAAAATQCAAAABDUCAAAABDYCAAAAATcCAAAAATgCAAAAATkCAAAAAToCADcAIQgzQAAAAAE0QAAAAAQ1QAAAAAQ2QAAAAAE3QAAAAAE4QAAAAAE5QAAAAAE6QAA4ACEOFQAANwAgFgAAOgAgFwAAOgAgMwEAAAABNAEAAAAENQEAAAAENgEAAAABNwEAAAABOAEAAAABOQEAAAABOgEAOQAhOwEAAAABPAEAAAABPQEAAAABCzMBAAAAATQBAAAABDUBAAAABDYBAAAAATcBAAAAATgBAAAAATkBAAAAAToBADoAITsBAAAAATwBAAAAAT0BAAAAAQkqAAA7ADArAAAdABAsAAA7ADAtAQA8ACEuAQA8ACEvAQA8ACEwAQA8ACExAQA8ACEyQAA9ACELMwEAAAABNAEAAAAENQEAAAAENgEAAAABNwEAAAABOAEAAAABOQEAAAABOgEAOgAhOwEAAAABPAEAAAABPQEAAAABCDNAAAAAATRAAAAABDVAAAAABDZAAAAAATdAAAAAAThAAAAAATlAAAAAATpAADgAIQgqAAA-ADArAAAXABAsAAA-ADAtAQA0ACEvAQA0ACEyQAA1ACE-AQA_ACE_QAA1ACEOFQAAQQAgFgAAQgAgFwAAQgAgMwEAAAABNAEAAAAFNQEAAAAFNgEAAAABNwEAAAABOAEAAAABOQEAAAABOgEAQAAhOwEAAAABPAEAAAABPQEAAAABDhUAAEEAIBYAAEIAIBcAAEIAIDMBAAAAATQBAAAABTUBAAAABTYBAAAAATcBAAAAATgBAAAAATkBAAAAAToBAEAAITsBAAAAATwBAAAAAT0BAAAAAQgzAgAAAAE0AgAAAAU1AgAAAAU2AgAAAAE3AgAAAAE4AgAAAAE5AgAAAAE6AgBBACELMwEAAAABNAEAAAAFNQEAAAAFNgEAAAABNwEAAAABOAEAAAABOQEAAAABOgEAQgAhOwEAAAABPAEAAAABPQEAAAABCCoAAEMAMCsAAAQAECwAAEMAMC0BADwAIS8BADwAITJAAD0AIT4BAEQAIT9AAD0AIQszAQAAAAE0AQAAAAU1AQAAAAU2AQAAAAE3AQAAAAE4AQAAAAE5AQAAAAE6AQBCACE7AQAAAAE8AQAAAAE9AQAAAAEAAAABQAEAAAABAUBAAAAAAQAAAAABQAEAAAABAAAAAAMVAAYWAAcXAAgAAAADFQAGFgAHFwAIAAAAAxUADhYADxcAEAAAAAMVAA4WAA8XABABAgECAwEFBgEGBwEHCAEJCgEKDAILDQMMDwENEQIOEgQREwESFAETFQIYGAUZGQkaGwobHAocHwodIAoeIQofIwogJQIhJgsiKAojKgIkKwwlLAomLQonLgIoMQ0pMhE"
};
async function decodeBase64AsWasm(wasmBase64) {
    const { Buffer } = await import('node:buffer');
    const wasmArray = Buffer.from(wasmBase64, 'base64');
    return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
    getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.js"),
    getQueryCompilerWasmModule: async () => {
        const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.js");
        return await decodeBase64AsWasm(wasm);
    },
    importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
    return runtime.getPrismaClient(config);
}
//# sourceMappingURL=class.js.map
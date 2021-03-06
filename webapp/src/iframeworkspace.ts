import * as data from "./data";
import * as mem from "./memoryworkspace";

type Header = pxt.workspace.Header;
type ScriptText = pxt.workspace.ScriptText;
type WorkspaceProvider = pxt.workspace.WorkspaceProvider;
type InstallHeader = pxt.workspace.InstallHeader;

function getHeaders(): Header[] {
    return mem.provider.getHeaders();
}

function getHeader(id: string): Header {
    return mem.provider.getHeader(id);
}

function getTextAsync(id: string): Promise<ScriptText> {
    return mem.provider.getTextAsync(id);
}

function initAsync(trg: string, ver: string): Promise<void> {
    return mem.provider.initAsync(trg, ver);
}

function saveAsync(header: Header, text?: ScriptText): Promise<void> {
    return mem.provider.saveAsync(header, text)
        .then(() => pxt.editor.postHostMessageAsync(<pxt.editor.EditorWorkspaceSaveRequest>{
            type: "pxthost",
            action: "workspacesave",
            project: { header, text },
            response: false
        })).then(() => { })
}

function installAsync(h0: InstallHeader, text: ScriptText): Promise<Header> {
    return mem.provider.installAsync(h0, text);
}

function saveToCloudAsync(h: Header): Promise<void> {
    return mem.provider.saveToCloudAsync(h);
}

function syncAsync(): Promise<pxt.editor.EditorSyncState> {
    return pxt.editor.postHostMessageAsync(<pxt.editor.EditorWorkspaceSyncRequest>{
        type: "pxthost",
        action: "workspacesync",
        response: true
    }).then((msg: pxt.editor.EditorWorkspaceSyncResponse) => {
        (msg.projects || []).forEach(mem.merge);
        data.invalidate("header:");
        data.invalidate("text:");

        // controllerId is a unique identifier of the controller source
        pxt.tickEvent("pxt.controller", {controllerId: msg.controllerId});

        return msg.editor;
    })
}

function resetAsync(): Promise<void> {
    return mem.provider.resetAsync()
        .then(() => pxt.editor.postHostMessageAsync(<pxt.editor.EditorWorkspaceSyncRequest>{
            type: "pxthost",
            action: "workspacereset",
            response: true
        })).then(() => { })
}

function loadedAsync(): Promise<void> {
    return mem.provider.loadedAsync()
        .then(() => pxt.editor.postHostMessageAsync(<pxt.editor.EditorWorkspaceSyncRequest>{
            type: "pxthost",
            action: "workspaceloaded",
            response: true
        })).then(() => { })
}

export const provider: WorkspaceProvider = {
    getHeaders,
    getHeader,
    getTextAsync,
    initAsync,
    saveAsync,
    installAsync,
    saveToCloudAsync,
    syncAsync,
    resetAsync,
    loadedAsync
}
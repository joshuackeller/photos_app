// AUTO GENERATED FILE BY @kalissaac/prisma-typegen
// DO NOT EDIT




export interface User {
    id: number,
    name: string,
    phone: string,
    accessCode?: AccessCode,
    folders: Folder[],
    createdAt: Date,
    updatedAt: Date,
}

export interface AccessCode {
    code: number,
    userId: number,
    user: User,
    createdAt: Date,
}

export interface Folder {
    id: number,
    name: string,
    userId: number,
    user: User,
    parentFolderId?: number,
    parentFolder?: Folder,
    childFolders: Folder[],
    images: Image[],
    createdAt: Date,
    updatedAt: Date,
}

export interface Image {
    id: number,
    name: string,
    folderId: number,
    folder: Folder,
}

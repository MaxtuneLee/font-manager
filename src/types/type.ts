// model Font {
//     id            String      @id @default(auto()) @map("_id") @db.ObjectId
//     name          String
//     path          String
//     size          Int
//     type          String
//     fontSubFamily String
//     copyright     String
//     license       String
//     uploadedAt    DateTime    @default(now())
//     FontFamily    FontFamily? @relation(fields: [fontFamilyId], references: [id])
//     fontFamilyId  String?     @db.ObjectId
//   }
  
//   model FontFamily {
//     id        String   @id @default(auto()) @map("_id") @db.ObjectId
//     name      String
//     fonts     Font[]
//     createdAt DateTime @default(now())
//     updatedAt DateTime @updatedAt
//   }
  
//   model accessToken {
//     id        String   @id @default(auto()) @map("_id") @db.ObjectId
//     token     String   @unique
//     createdAt DateTime @default(now())
//     updatedAt DateTime @updatedAt
//   }

export interface Font {
    id?: string;
    name: string;
    path: string;
    size: number;
    type: string;
    fontSubFamily: string;
    copyright: string;
    license: string;
    uploadedAt: string;
    fontFamilyId?: string;
}

export interface FontFamily {
    id: string;
    name: string;
    fonts: Font[];
    createdAt: string;
    updatedAt: string;
}

export interface AccessToken {
    id: string;
    token: string;
    createdAt: string;
    updatedAt: string;
}
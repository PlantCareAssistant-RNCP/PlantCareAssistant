-- CreateTable
CREATE TABLE "COMMENT" (
    "comment_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "post_id" INTEGER NOT NULL,
    "photo" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    "deleted_at" DATETIME,
    CONSTRAINT "COMMENT_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "POST" ("post_id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "COMMENT_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "USER" ("user_id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "LIKES" (
    "post_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" DATETIME,

    PRIMARY KEY ("post_id", "user_id"),
    CONSTRAINT "LIKES_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "USER" ("user_id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "LIKES_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "POST" ("post_id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "PLANT" (
    "plant_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "plant_name" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "plant_type_id" INTEGER NOT NULL,
    "photo" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    "deleted_at" DATETIME,
    CONSTRAINT "PLANT_plant_type_id_fkey" FOREIGN KEY ("plant_type_id") REFERENCES "PLANT_TYPE" ("plant_type_id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "PLANT_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "USER" ("user_id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "PLANT_TYPE" (
    "plant_type_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "plant_type_name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    "deleted_at" DATETIME
);

-- CreateTable
CREATE TABLE "POST" (
    "post_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "photo" TEXT,
    "user_id" INTEGER NOT NULL,
    "plant_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    "deleted_at" DATETIME,
    CONSTRAINT "POST_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "PLANT" ("plant_id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "POST_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "USER" ("user_id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "USER" (
    "user_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    "deleted_at" DATETIME
);

-- CreateTable
CREATE TABLE "USERS_POST" (
    "user_id" INTEGER NOT NULL,
    "post_id" INTEGER NOT NULL,

    PRIMARY KEY ("user_id", "post_id"),
    CONSTRAINT "USERS_POST_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "POST" ("post_id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "USERS_POST_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "USER" ("user_id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "USER_PLANT" (
    "user_id" INTEGER NOT NULL,
    "plant_id" INTEGER NOT NULL,

    PRIMARY KEY ("user_id", "plant_id"),
    CONSTRAINT "USER_PLANT_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "PLANT" ("plant_id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "USER_PLANT_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "USER" ("user_id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_USER_1" ON "USER"("username");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_USER_2" ON "USER"("email");
Pragma writable_schema=0;

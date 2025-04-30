-- First add the columns as nullable
ALTER TABLE "projects" ADD COLUMN "client" VARCHAR(255);
ALTER TABLE "projects" ADD COLUMN "track" VARCHAR(50);

-- Update existing records with default values
UPDATE "projects" SET "client" = 'Unknown Client', "track" = 'education';

-- Then make the columns required
ALTER TABLE "projects" ALTER COLUMN "client" SET NOT NULL;
ALTER TABLE "projects" ALTER COLUMN "track" SET NOT NULL;
ALTER TABLE `User` ADD COLUMN `role` ENUM('Admin', 'Staff') NOT NULL DEFAULT 'Staff';

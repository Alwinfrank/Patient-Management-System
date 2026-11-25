ALTER TABLE `Payment` ADD COLUMN `activeBillId` CHAR(36) NULL;
CREATE UNIQUE INDEX `Payment_activeBillId_key` ON `Payment`(`activeBillId`);

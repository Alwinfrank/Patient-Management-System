CREATE TABLE `User` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `User_email_key` (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Patient` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `age` INTEGER NOT NULL,
  `gender` ENUM('Male', 'Female', 'Other') NOT NULL,
  `phoneNumber` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `address` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Patient_email_key` (`email`),
  INDEX `Patient_name_idx` (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Bill` (
  `id` CHAR(36) NOT NULL,
  `patientId` CHAR(36) NOT NULL,
  `description` VARCHAR(191) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `tax` DECIMAL(12,2) NOT NULL,
  `totalAmount` DECIMAL(12,2) NOT NULL,
  `paymentStatus` ENUM('Pending', 'Paid', 'Failed', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `Bill_patientId_createdAt_idx` (`patientId`, `createdAt`),
  CONSTRAINT `Bill_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Payment` (
  `id` CHAR(36) NOT NULL,
  `billId` CHAR(36) NOT NULL,
  `razorpayOrderId` VARCHAR(191) NULL,
  `razorpayPaymentId` VARCHAR(191) NULL,
  `razorpaySignature` VARCHAR(191) NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `paymentStatus` ENUM('Pending', 'Paid', 'Failed', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Payment_razorpayOrderId_key` (`razorpayOrderId`),
  UNIQUE INDEX `Payment_razorpayPaymentId_key` (`razorpayPaymentId`),
  INDEX `Payment_billId_createdAt_idx` (`billId`, `createdAt`),
  CONSTRAINT `Payment_billId_fkey` FOREIGN KEY (`billId`) REFERENCES `Bill` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

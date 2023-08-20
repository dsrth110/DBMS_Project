-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Aug 20, 2023 at 09:54 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `Canteen`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_info`
--

CREATE TABLE `admin_info` (
  `id` varchar(9) NOT NULL,
  `name` varchar(50) NOT NULL,
  `address` varchar(50) NOT NULL,
  `phone` bigint(20) NOT NULL,
  `update_time` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_info`
--

INSERT INTO `admin_info` (`id`, `name`, `address`, `phone`, `update_time`) VALUES
('070BEI119', 'Binnu Basnet', 'yetai tira katai', 9875928452, '2023-08-14 08:27:46'),
('070BEI120', 'Binnu Basnet', 'yetai tira katai', 9875928452, '2023-08-14 08:30:57'),
('070BEI121', 'Binnu Basnet', 'yetai tira katai', 9875928452, '2023-08-14 08:31:39'),
('070BEI122', 'Binnu Basnet', 'yetai tira katai', 9875928452, '2023-08-14 08:34:16'),
('070BEI123', 'Binnu Basnet', 'yetai tira katai', 9875928452, '2023-08-14 08:36:16'),
('070BEI188', 'Binnu Basnet', 'yetai tira katai', 9875928452, '2023-08-14 08:37:50'),
('STAFF1', 'Jitendra Manandhar', 'Jawlakhel - 13 - Lalitpur', 9834523761, '2023-08-14 08:13:41');

-- --------------------------------------------------------

--
-- Table structure for table `customer_info`
--

CREATE TABLE `customer_info` (
  `id` varchar(9) NOT NULL,
  `name` varchar(50) NOT NULL,
  `department` varchar(50) NOT NULL,
  `batch` smallint(11) NOT NULL,
  `available_balance` mediumint(9) NOT NULL,
  `update_time` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer_info`
--

INSERT INTO `customer_info` (`id`, `name`, `department`, `batch`, `available_balance`, `update_time`) VALUES
('062BEI02', 'Mehdi Hassan', 'Mechanical Engineering', 62, 0, '2023-08-14 08:14:20'),
('070BEI02', 'Binit Kc', 'Mechanical Engineering', 70, 0, '2023-08-14 08:14:20'),
('070BEI112', 'Binay Basnet', 'Mechanical Engineering', 70, 0, '2023-08-14 08:14:20'),
('070BEI113', 'Binaay Basnet', 'Mechanical Engineering', 70, 0, '2023-08-14 08:14:20'),
('070BEI114', 'Binnu Basnet', 'Mechanical Engineering', 70, 0, '2023-08-14 08:14:20'),
('070BEI115', 'Binnu Basnet', 'Mechanical Engineering', 70, 0, '2023-08-14 08:14:20'),
('070BEI116', 'Binnu Basnet', 'Mechanical Engineering', 70, 0, '2023-08-14 08:14:20'),
('070BEI117', 'Binnu Basnet', 'Mechanical Engineering', 70, 0, '2023-08-14 08:14:20'),
('070BEI118', 'Binnu Basnet', 'Mechanical Engineering', 70, 0, '2023-08-14 08:14:20'),
('070BEI119', 'Binnu Basnet', 'Mechanical Engineering', 70, 0, '2023-08-14 08:15:08'),
('070BEI200', 'Binnu Basnet', 'Mechanical Engineering', 70, 0, '2023-08-14 08:36:51'),
('070BEI201', 'Binnu Basnet', 'Mechanical Engineering', 70, 0, '2023-08-14 08:37:35'),
('077BEI019', 'Ashim Panthi', 'DOECE', 77, 0, '2023-08-14 08:14:20'),
('077BEI020', 'Insaph Angdemebe', 'Civil Engineering', 77, 0, '2023-08-14 08:14:20'),
('077BEI021', 'Kunal Kamra', 'BArch', 77, 0, '2023-08-14 08:14:20');

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `item_id` varchar(20) NOT NULL,
  `item_name` varchar(50) NOT NULL,
  `image` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `price` mediumint(9) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`item_id`, `item_name`, `image`, `category`, `price`) VALUES
('samosa_01', 'Samosa', 'at the c drive at the phutouuuues folder named as a photono1', 'breakfast', 20);

-- --------------------------------------------------------

--
-- Table structure for table `order_details`
--

CREATE TABLE `order_details` (
  `order_id` int(11) NOT NULL,
  `id` varchar(20) NOT NULL,
  `item_id` varchar(20) NOT NULL,
  `quantity` int(11) NOT NULL,
  `total_price` int(11) NOT NULL,
  `update_time` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_details`
--

INSERT INTO `order_details` (`order_id`, `id`, `item_id`, `quantity`, `total_price`, `update_time`) VALUES
(2, '077BEI019', 'samosa_01', 5, 100, '2023-08-20 13:30:00'),
(3, '077BEI019', 'samosa_01', 5, 100, '2023-08-20 13:31:27');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(9) NOT NULL,
  `hashed_password` varchar(100) NOT NULL,
  `role` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `hashed_password`, `role`) VALUES
('062BEI02', '$2b$10$gM2t9yUg893MT01OZi2HJuGJd75HFsDEhG0hKs38fDZeiUM6PHK0S', 'customer'),
('070BEI02', '$2b$10$/BSVYB6I1HgF0aM7obP/j.m/lBTGxLZzWnKzgwG/Z7YTbew/eCley', 'admin'),
('070BEI112', '$2b$10$lkzeo4Fdx.SGDMcN14qV1OSv9sdi40DeXzSYMJm5VXmMkVzidtWpC', 'customer'),
('070BEI113', '$2b$10$0oHlDF3ZaRmTBBa70DZar.BcwhWPuaA7jfmTOiBIepE/J1hnLTJcO', 'customer'),
('070BEI114', '$2b$10$MeethCX3.Uh0obvP/9vDQuuM6PuNREzKFQA3hTTCdBXk29wF7oLbO', 'customer'),
('070BEI115', '$2b$10$Va5RhU8F31Ft8SGphCI1NeJsepBqrKAiVmooXypj1dQ2RLkowRky2', 'customer'),
('070BEI116', '$2b$10$YfCdSmhwwYF1YEbl0E7ckOVtmbsLncxz43yJtBQkBQU/vQ5egOY3.', 'customer'),
('070BEI117', '$2b$10$oODnFej7BaR.nGJWrJSBU.DrXIWUaMiKmVJ2z1t2h7QSgb9BqclDu', 'customer'),
('070BEI118', '$2b$10$q.VEb6ICS.5CIJhhh0q6X.sQvs6C74jYXeJlZ9ZlhYe3Ojqu51v2S', 'customer'),
('070BEI119', '$2b$10$ZjgHIrmRX7f1GN9ZnVGbL.CIdpJ9UX1k2JEaMW6v.3dPxtxA4Xv/a', 'customer'),
('070BEI120', '$2b$10$5mX9yB4cAslQrSRxKPN0F./3mF23y9v4T6hHcYgh9NyHZC.Jz531.', 'admin'),
('070BEI121', '$2b$10$C3O2Q8fwCiE5R6sUynetF.AWQXClVyU7KMafJmHYg2FWgH5cBKeMW', 'admin'),
('070BEI122', '$2b$10$udMrnl85R1AVtJceWsGnR.NPef1lekZQpyT64m3871LZnses9Kama', 'admin'),
('070BEI123', '$2b$10$z7WrVJlI1isAHoI6XUdYaeBQcXB/KXd0X3CJVHPM8xAyikR2GvE6a', 'admin'),
('070BEI188', '$2b$10$CSsa2YwK1bpP20W2OW5doOP0.6kPzw4ueQuOSJwxUQdNWmVh4t/7W', 'admin'),
('070BEI200', '$2b$10$p9PnwDJTltrXLbJE0.mD1uH5w9o8E8EWFuI7f8CAJ.Oj3eoGEd4Oq', 'customer'),
('070BEI201', '$2b$10$0D0R0gVH7R5aktZjKrhMjeS/UXTYNVPGG35lDqqeP8IAazJLudOfu', 'customer'),
('077BEI019', '$2b$10$7cizfSpd5P9IgujYYpKbk.ZbU8ZGi8i/hnaukCOAym4z0CSQElAYm', 'customer'),
('077BEI020', '$2b$10$gjoQddwB5z7a426Eei71Oe5Ei.UCn6qXnj9Lu6wG8KzUVf80ghkFa', 'customer'),
('077BEI021', '$2b$10$tIdDQjXaF9e5XaUVEyWh/.dz9V/./TGNIsaK7nj4ZUf3V.6dWxvS.', 'customer');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_info`
--
ALTER TABLE `admin_info`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customer_info`
--
ALTER TABLE `customer_info`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`item_id`);

--
-- Indexes for table `order_details`
--
ALTER TABLE `order_details`
  ADD PRIMARY KEY (`order_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `order_details`
--
ALTER TABLE `order_details`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

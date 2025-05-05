#!/usr/bin/env bash
# Exit on error
set -e

echo "Starting build script"

# Cài đặt các thư viện
npm install

# Chạy lệnh build để biên dịch TypeScript và xây dựng ứng dụng
npm run build

# Cập nhật schema cơ sở dữ liệu
npm run db:push

echo "Build script completed successfully"
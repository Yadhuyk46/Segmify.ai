# API Guide

## Authentication

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/auth/verify-email`
- `GET /api/v1/auth/me`
- `PUT /api/v1/auth/profile`

## Customers

- `GET /api/v1/customers`
- `POST /api/v1/customers`
- `PUT /api/v1/customers/{customer_id}`
- `DELETE /api/v1/customers/{customer_id}`

## Segmentation

- `POST /api/v1/segmentation/train`
- `POST /api/v1/segmentation/predict`

## Analytics and Reports

- `GET /api/v1/analytics/dashboard`
- `POST /api/v1/reports/export`
- `GET /api/v1/notifications`

## Admin

- `GET /api/v1/admin/users`
- `GET /api/v1/admin/notifications`
- `GET /api/v1/admin/logs`

Swagger documentation is automatically available at `/docs`.

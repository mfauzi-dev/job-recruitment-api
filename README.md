# Job Recruitment API

Backend API untuk sistem **Job Recruitment Platform** yang dibangun menggunakan **Express.js**.  
Project ini mensimulasikan sistem rekrutmen nyata dengan **authentication, role-based access control (RBAC), dan application flow** seperti yang digunakan pada Applicant Tracking System (ATS).

API ini cocok digunakan sebagai **portfolio backend developer** karena fokus pada domain logic, security, dan struktur project yang rapi.

---

## Fitur Utama

### Authentication & User Management

- Register & Login menggunakan **JWT Authentication**
- **Refresh Token** untuk menjaga sesi login
- **Email Verification** (resend & verify)
- **Forgot & Reset Password**
- Update profile & update password
- Get authenticated user profile

### Role-Based Access Control (RBAC)

- Pemisahan role **Company** dan **Candidate**
- Proteksi route menggunakan middleware authorization
- Validasi akses berbasis role pada setiap fitur utama

### Company Management

- Create, view, update, dan delete company profile
- Upload **company logo** dan **thumbnail**
- Company hanya dapat mengelola data miliknya sendiri

### Job Management

- Company dapat membuat, melihat, mengubah, dan menghapus job
- Company dapat melihat daftar job yang dimilikinya
- Public dapat melihat daftar job dan detail job

### Application Management

- Candidate dapat melamar job (apply) dengan upload **cover letter**
- Candidate dapat melihat detail application miliknya
- Company dapat melihat daftar applicant per job
- Company dapat memperbarui status application kandidat

### File Upload Handling

- Upload CV pada user profile
- Upload company logo & thumbnail
- Upload cover letter pada proses melamar job

### Project Architecture

- Modular folder structure (controller, service, route, middleware, utils)
- Centralized error handling
- Environment-based configuration menggunakan dotenv
- Sequelize ORM dengan MySQL

## 📁 Uploads Directory Setup

Project ini menggunakan folder `uploads/` untuk menyimpan file hasil upload seperti:

- CV (curriculum vitae)
- Cover letter
- Company logo
- Company thumbnail

Folder `uploads/` **tidak disertakan di dalam repository** demi keamanan dan kebersihan repo.

### Buat folder `uploads` secara manual setelah clone:

```bash
mkdir uploads
mkdir uploads/curriculumVitae
mkdir uploads/coverLetter
mkdir uploads/logo
mkdir uploads/thumbnail
```

## File Upload

Folder `uploads/` digunakan untuk menyimpan file hasil upload secara lokal dan tidak disertakan di dalam repository.

## **Clone repository**

```bash
git clone https://github.com/mfauzi-dev/job-recruitment-api.git
```

## **Setup Project Baru**

1. **Rename folder sesuai project baru**

    ```bash
    mv job-recruitment-api my-new-project
    cd my-new-project
    ```

2. **Hapus riwayat Git lama**

    ```bash
    rm -rf .git
    ```

3. **Install dependencies**

    ```bash
    npm install
    ```

4. **Buat file .env berdasarkan .env.example**

    ```bash
    cp .env.example .env
    ```

5. **Jalankan project**

    ```bash
    npm run dev
    ```

6. **Jalankan scripts seeder untuk roles dan admin**

    ```bash
    npm run dev
    ```

## Teknologi

- Express.js

- Sequelize

- MySQL

- JWT

- bcrypt

## Lisensi

Proyek ini menggunakan lisensi MIT.  
Lihat file [LICENSE](LICENSE) untuk detailnya.

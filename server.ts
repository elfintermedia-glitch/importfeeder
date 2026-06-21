import "dotenv/config";
import express from "express";
import path from "path";
import crypto from "crypto";
import { exec } from "child_process";
import util from "util";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import { requireAuth } from "./src/middleware/auth.ts";
import { db } from "./src/db/index.ts";
import { neofeederConfig, students, prodi, periode, dosen } from "./src/db/schema.ts";
import { eq } from "drizzle-orm";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000; // Tetap 3000 di environment lokal ini agar preview tidak error. Di aaPanel, Anda bisa mengubahnya.

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    
    // Hash input credentials using SHA-256 for comparison
    const inputUserHash = crypto.createHash('sha256').update(username || '').digest('hex');
    const inputPassHash = crypto.createHash('sha256').update(password || '').digest('hex');
    
    // Expected hashes for username and password
    const expectedUserHash = "186cf774c97b60a1c106ef718d10970a6a06e06bef89553d9ae65d938a886eae";
    const expectedPassHash = "ff0f7bbea275e3f9aea818cfdc486d0c835531521cb990ff2e9b96bb1d076a80"; 

    if (inputUserHash === expectedUserHash && inputPassHash === expectedPassHash) {
      res.json({
        token: "secret-local-token",
        user: { displayName: "Eko Fachtur", uid: "local-eko" }
      });
    } else {
      res.status(401).json({ error: "Username atau password salah" });
    }
  });

  app.get("/api/me", requireAuth, async (req: any, res) => {
    res.json({ user: req.dbUser });
  });

  app.get("/api/config", requireAuth, async (req: any, res) => {
    const userId = req.dbUser.id;
    try {
      const config = await db.query.neofeederConfig.findFirst({
        where: eq(neofeederConfig.userId, userId)
      });
      res.json({ config });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch config" });
    }
  });

  app.post("/api/config", requireAuth, async (req: any, res) => {
    const userId = req.dbUser.id;
    const { url, username, password } = req.body;
    try {
      const existing = await db.query.neofeederConfig.findFirst({
        where: eq(neofeederConfig.userId, userId)
      });
      if (existing) {
        await db.update(neofeederConfig)
          .set({ url, username, password })
          .where(eq(neofeederConfig.userId, userId));
      } else {
        await db.insert(neofeederConfig)
          .values({ userId, url, username, password });
      }
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to update config" });
    }
  });

  app.get("/api/prodi", requireAuth, async (req: any, res) => {
    const userId = req.dbUser.id;
    try {
      const allProdi = await db.query.prodi.findMany({
        where: eq(prodi.userId, userId),
        orderBy: (prodi, { asc }) => [asc(prodi.kode_program_studi)]
      });
      res.json({ prodi: allProdi });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch prodi" });
    }
  });

  app.post("/api/prodi/bulk", requireAuth, async (req: any, res) => {
    const userId = req.dbUser.id;
    const { items } = req.body;
    try {
      for (const item of items) {
        // Find if prodi exists by kode_program_studi
        const existing = await db.query.prodi.findFirst({
          where: eq(prodi.kode_program_studi, item.kode_program_studi)
        });
        
        if (existing && existing.userId === userId) {
          await db.update(prodi)
            .set({ 
              nama_program_studi: item.nama_program_studi,
              status: item.status,
              nama_jenjang_pendidikan: item.nama_jenjang_pendidikan
            })
            .where(eq(prodi.id, existing.id));
        } else {
          await db.insert(prodi).values({
            userId,
            kode_program_studi: item.kode_program_studi,
            nama_program_studi: item.nama_program_studi,
            status: item.status,
            nama_jenjang_pendidikan: item.nama_jenjang_pendidikan
          });
        }
      }
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to bulk add prodi" });
    }
  });

  app.get("/api/periode", requireAuth, async (req: any, res) => {
    const userId = req.dbUser.id;
    try {
      const allPeriode = await db.query.periode.findMany({
        where: eq(periode.userId, userId),
        orderBy: (periode, { desc }) => [desc(periode.periode_pelaporan)]
      });
      res.json({ periode: allPeriode });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch periode" });
    }
  });

  app.post("/api/periode/bulk", requireAuth, async (req: any, res) => {
    const userId = req.dbUser.id;
    const { items } = req.body;
    try {
      for (const item of items) {
        const existing = await db.query.periode.findFirst({
          where: eq(periode.id_prodi, item.id_prodi)
        });
        
        if (existing && existing.userId === userId) {
          await db.update(periode)
            .set({ 
              kode_prodi: item.kode_prodi,
              nama_program_studi: item.nama_program_studi,
              status_prodi: item.status_prodi,
              jenjang_pendidikan: item.jenjang_pendidikan,
              periode_pelaporan: item.periode_pelaporan,
              tipe_periode: item.tipe_periode
            })
            .where(eq(periode.id, existing.id));
        } else {
          await db.insert(periode).values({
            userId,
            id_prodi: item.id_prodi,
            kode_prodi: item.kode_prodi,
            nama_program_studi: item.nama_program_studi,
            status_prodi: item.status_prodi,
            jenjang_pendidikan: item.jenjang_pendidikan,
            periode_pelaporan: item.periode_pelaporan,
            tipe_periode: item.tipe_periode
          });
        }
      }
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to bulk add periode" });
    }
  });

  app.get("/api/dosen", requireAuth, async (req: any, res) => {
    const userId = req.dbUser.id;
    try {
      const allDosen = await db.query.dosen.findMany({
        where: eq(dosen.userId, userId),
        orderBy: (dosen, { asc }) => [asc(dosen.nama_dosen)]
      });
      res.json({ dosen: allDosen });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch dosen" });
    }
  });

  app.post("/api/dosen/bulk", requireAuth, async (req: any, res) => {
    const userId = req.dbUser.id;
    const { items } = req.body;
    try {
      for (const item of items) {
        const existing = await db.query.dosen.findFirst({
          where: eq(dosen.id_dosen, item.id_dosen)
        });
        
        if (existing && existing.userId === userId) {
          await db.update(dosen)
            .set({ 
              nama_dosen: item.nama_dosen,
              nidn: item.nidn,
              jenis_kelamin: item.jenis_kelamin,
              id_status_aktif: item.id_status_aktif,
              nama_status_aktif: item.nama_status_aktif
            })
            .where(eq(dosen.id, existing.id));
        } else {
          await db.insert(dosen).values({
            userId,
            id_dosen: item.id_dosen,
            nama_dosen: item.nama_dosen,
            nidn: item.nidn,
            jenis_kelamin: item.jenis_kelamin,
            id_status_aktif: item.id_status_aktif,
            nama_status_aktif: item.nama_status_aktif
          });
        }
      }
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to bulk add dosen" });
    }
  });

  app.get("/api/students", requireAuth, async (req: any, res) => {
    const userId = req.dbUser.id;
    try {
      const allStudents = await db.query.students.findMany({
        where: eq(students.userId, userId),
        orderBy: (students, { desc }) => [desc(students.createdAt)]
      });
      res.json({ students: allStudents });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch students" });
    }
  });

  app.post("/api/students", requireAuth, async (req: any, res) => {
    const userId = req.dbUser.id;
    const { nim, name, programStudy, admissionPeriod, status } = req.body;
    try {
      await db.insert(students).values({
        userId, nim, name, programStudy, admissionPeriod, status
      });
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to add student" });
    }
  });

  // Bulk update students status (e.g. from Excel)
  app.post("/api/students/bulk", requireAuth, async (req: any, res) => {
    const userId = req.dbUser.id;
    const { items } = req.body; // array of students
    try {
      for (const item of items) {
        // Find if NIM exists for user
        const existing = await db.query.students.findFirst({
          where: eq(students.nim, item.nim) // Assuming NIM is unique per student
        });
        // We should really handle this better but for MVP this is OK
        if (existing && existing.userId === userId) {
          await db.update(students)
            .set({ 
              name: item.name, 
              programStudy: item.programStudy, 
              admissionPeriod: item.admissionPeriod, 
              status: item.status 
            })
            .where(eq(students.id, existing.id));
        } else {
          await db.insert(students).values({
            userId,
            nim: item.nim,
            name: item.name,
            programStudy: item.programStudy,
            admissionPeriod: item.admissionPeriod,
            status: item.status || 'Baru'
          });
        }
      }
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to bulk add students" });
    }
  });

  app.post("/api/neofeeder-test", requireAuth, async (req: any, res) => {
    const { url, username, password, action, payload } = req.body;
    
    try {
      if (!url || !username || !password) {
        return res.status(400).json({ error: "URL, Username, and Password are required" });
      }

      // First get token (GetToken)
      const tokenRes = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          act: "GetToken",
          username: username,
          password: password
        })
      });
      const tokenData = await tokenRes.json();
      
      if (tokenData.error_code !== 0) {
        return res.status(400).json({ error: tokenData.error_desc });
      }
      
      const token = tokenData.data.token;
      
      // Perform action
      const actionRes = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          act: action,
          token: token,
          ...payload
        })
      });
      
      const actionData = await actionRes.json();
      res.json(actionData);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || "Failed to communicate with Neofeeder server" });
    }
  });

  // Neofeeder Proxy Endpoint (so we don't hit CORS when calling Neofeeder)
  app.post("/api/neofeeder", requireAuth, async (req: any, res) => {
    const userId = req.dbUser.id;
    const { action, payload } = req.body;
    
    try {
      const config = await db.query.neofeederConfig.findFirst({
        where: eq(neofeederConfig.userId, userId)
      });
      
      if (!config) {
        return res.status(400).json({ error: "Neofeeder config not found" });
      }

      // First get token (GetToken)
      const tokenRes = await fetch(config.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          act: "GetToken",
          username: config.username,
          password: config.password
        })
      });
      const tokenData = await tokenRes.json();
      
      if (tokenData.error_code !== 0) {
        return res.status(400).json({ error: tokenData.error_desc });
      }
      
      const token = tokenData.data.token;
      
      // Perform action
      const actionRes = await fetch(config.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          act: action,
          token: token,
          ...payload
        })
      });
      
      const actionData = await actionRes.json();
      res.json(actionData);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || "Failed to communicate with Neofeeder server" });
    }
  });

  app.post("/api/update-app", requireAuth, async (req: any, res) => {
    try {
      const execPromise = util.promisify(exec);
      
      let logs = "";
      try {
        const { stdout, stderr } = await execPromise("git pull");
        logs += "Git pull:\n" + stdout + (stderr ? "\n" + stderr : "") + "\n\n";
      } catch (gitError: any) {
        logs += "Git pull dilewati (mungkin bukan git repository atau belum disetup).\n\n";
      }

      const { stdout, stderr } = await execPromise("npm install && npm run build");
      logs += "Build Process:\n" + stdout + (stderr ? "\n" + stderr : "");
      
      res.json({ 
        success: true, 
        message: "Aplikasi berhasil diperbarui. Server akan melakukan restart ototmatis.",
        logs: logs
      });
      
      // Attempt to restart if running under PM2
      setTimeout(() => {
        exec("pm2 restart importer-app || pm2 restart all", (err: any) => {
          if (err) {
            console.error("Failed to restart via PM2, exiting process to allow container restart.");
            process.exit(0);
          }
        });
      }, 2000);
      
    } catch (e: any) {
      console.error("Update failed:", e);
      res.status(500).json({ 
        error: e.message || "Gagal memperbarui aplikasi",
        logs: (e.stdout || "") + "\n" + (e.stderr || "")
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running locally on http://localhost:${PORT}`);
    console.log(`Server configured for production domain: https://importer.elfatta-intermedia.com/`);
  });
}

startServer();

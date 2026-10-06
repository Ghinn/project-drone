import { Request, Response } from 'express';
import { firebaseAuth } from '../lib/firebase';

export const changeAccountPassword = async (req: Request, res: Response) => {
    try {
        const currentUser = (req as any).currentUser; 
        
        if (!currentUser || !currentUser.firebaseUid) {
            return res.status(401).json({ error: 'Tidak terautentikasi atau Firebase UID tidak ditemukan.' });
        }

        const { newPassword } = req.body;
        
        if (!newPassword) {
            return res.status(400).json({ error: 'Kata sandi baru wajib diisi.' });
        }

        // Update Password langsung di Firebase Auth (Source of Truth)
        await firebaseAuth.updateUser(currentUser.firebaseUid, {
            password: newPassword
        });

        return res.status(200).json({ message: 'Kata sandi berhasil diperbarui.' });

    } catch (error: any) {
        console.error('Change Password Error:', error);
        if (error.code === 'auth/weak-password') {
            return res.status(400).json({ error: 'Kata sandi terlalu lemah menurut kebijakan server.' });
        }
        return res.status(500).json({ error: 'Terjadi kesalahan server saat memperbarui kata sandi.' });
    }
};
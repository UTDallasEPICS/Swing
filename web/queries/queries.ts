import prisma from "./prisma"


// get all patients 
export async function getAllPatients() {
    try {
        return await prisma.patient.findMany({
            select: {
                id: true,
                name: true,
                dob: true,
            },
        });
    } catch (error) {
        console.error('Error fetching patients:', error);
        throw error;
    }
}



export async function getPatientByID(patientID: number) {
    try {
        return await prisma.patient.findUnique({
            where: {
                id: patientID
            },
            
            select: {
                id: true,
                name: true,
                dob: true,
            },
        });
    } catch (error) {
        console.error('Error fetching patient by id:', error);
        throw error;
    }
}



export async function getPatientByName(patientName: string) {
    try {
        return await prisma.patient.findMany({
            where: {
                name: patientName
            },
            
            select: {
                id: true,
                name: true,
                dob: true,
            },
        });
    } catch (error) {
        console.error('Error fetching patient(s) by name:', error);
        throw error;
    }
}


export async function getPatientResults(patientID: number) {
    try {
        return await prisma.treatmentResult.findMany({
            where: {
                patientId: patientID
            },
            
            include: {
                BeforeAnalysis: true,
                AfterAnalysis: true,
            },
        });
    } catch (error) {
        console.error('Error fetching patient(s) results:', error);
        throw error;
    }
}


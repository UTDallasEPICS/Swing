import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { writeFile } from 'fs/promises';
//get handler
export async function GET(request: Request) {
  //console.log("your in analyze")
  try {
    //create url object, allows to extract query params
    const url = new URL(request.url);
    //get params from query string, if not provided then defaults
    const page = Number(url.searchParams.get('page') ?? 1);
    const perPage = Math.min(100, Number(url.searchParams.get('perPage') ?? 25));
    //calcs how many items to skip based on page num
    const skip = (Math.max(1, page) - 1) * perPage;
    //runs both queries at the same time: get patient records, count total num of patient records in the table
    const [items, total] = await Promise.all([
      prisma.patient.findMany({
        skip,
        take: perPage,
        orderBy: { id: 'desc' },
      }),
      prisma.patient.count(),
    ]);
    //return paginated data and meta info
    return NextResponse.json({ items, total, page, perPage });
  } catch (e) { //error response
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
  }
}
//put handler
export async function PUT(request: Request) {
  try {
    //parse json body
    const body = await request.json();
    //validate id
    if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    if (!body.name && !body.dob) return NextResponse.json({error:'Needs to atleast a name or DOB'}, {status: 400})
    const updateData: any = {};
    if (body.name) updateData.name = body.name;
    if (body.dob) updateData.dob = new Date(body.dob)
    //perform update 
    const updated = await prisma.patient.update({
      where: { id: Number(body.id) }, //which record to update
      data: updateData,
    });
    return NextResponse.json(updated); //return updated record
  } catch (e) { //error response
    console.error(e);
    return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 });
  }
}
//delete handler, safely deletes patient record
export async function DELETE(request: Request) {
  try {
    //parse json body
    const body = await request.json(); 
    //validate id
    if (!body.id) return NextResponse.json({error: 'Missing id'}, {status: 400});
    //attempt to delete patient record, if does not exist throw error
    const deleted = await prisma.patient.delete({where: { id: Number(body.id)}});
    //return deleted record
    return NextResponse.json(deleted);
  } catch (e) { //error response
    console.error(e);
    return NextResponse.json({error: 'Failed to delete patient'}, {status: 500});
  }
}
export async function POST(request: Request){
    try{
      const {name, dob} = await request.json()

      if(!name){
        return NextResponse.json({
          error: 'Missing name'
        }, {status: 400})
        
      }
      // Create patient in database using Prisma
      const newPatient = await prisma.patient.create({
        data: {
          name: name,
          dob: dob ? new Date(dob) : null,
          // Results will be created separately if needed
        },
      });
      return NextResponse.json(newPatient, {status: 201})
    }catch(e){
      console.error('error creating patient', e);
      return NextResponse.json({
        error: 'Failed to create patient record due to a server error.'
      }, {status: 500})
    }
}

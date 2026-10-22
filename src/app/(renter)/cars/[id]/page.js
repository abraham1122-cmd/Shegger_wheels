

import carsData from "@/data/cars.json";

import Link from "next/link";

import { notFound } from "next/navigation";



export const instant = false;


export default async function CarDetails({ params }){

    const { id } = await params;

    const car = carsData.find((item)=>String(item.id) === id );


    if(!car){
        notFound();
    }



    return(
        <>
        <main className="">

            <img 
            src={car.image}
            alt={car.name}
            className=""
            />

            <h3 className="">
                Name: {car.name}
            </h3>

            <p>
                Price: {car.pricePerDay} ETB /day
            </p>
            <p>
                Brand: {car.Brand}
            </p>
            <p>
                Model: {car.Model}
            </p>
            <p>
                Color: {car.color}
            </p>
            <p>
                Transmition: {car.Transmition}
            </p>

            <p>
                Seats: {car.Seats}
            </p>
            <p>


            </p>

            <Link href={`/checkout?carId=${encodeURIComponent(car.id)}`}
            className=""
            >
              Book-Now

            </Link>

        </main>
        </>
    )

}

import BookingForm from "@/components/bookings/booking-form";

import carsData from "@/data/cars.json";
import { notFound } from "next/navigation";



export const instant = false;

export default async function CheckOutPage({ searchParams }){

    const { carId } = await searchParams;

    const car = carsData.find((item)=>String(item.id) === carId);


    if(!car){
       
      notFound();
    
    }

  return <BookingForm car={car} />
}
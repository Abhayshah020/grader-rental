import BookingForm from "@/components/booking-form";
import { MapPin, Phone, Clock3 } from "lucide-react";
export const metadata = { title: "Booking & Contact | Siraha Grader Roller Rental Service" };
export default function BookingPage(){return <main>
 <section className="bg-[#f4f6f7] py-16 sm:py-20 hidden md:block"><div className="container-wide"><p className="eyebrow">Booking & contact</p><h1 className="mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl">Let's talk about your next project.</h1><p className="mt-5 max-w-2xl text-base leading-8 text-[#637381]">Request a grader, road roller or excavator, or send us a general question. Share a few details and we will follow up directly.</p></div></section>
 <section className="section-space"><div className="container-wide grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
  <aside><p className="eyebrow">Contact details</p><h2 className="mt-3 text-2xl font-extrabold">Speak with our rental service.</h2><p className="mt-4 text-sm leading-7 text-[#637381]">For availability, rates, transport and project requirements, call us directly or submit the form. A booking request is not a confirmed reservation until details are agreed with our team.</p>
   <div className="mt-8 space-y-6">
    <div className="flex gap-4"><span className="flex h-11 w-11 items-center justify-center border border-[#e5a928] text-[#a87412]"><Phone size={19}/></span><div><p className="text-xs font-bold uppercase tracking-wider text-[#71808a]">Phone</p><a href="tel:9702803911" className="mt-1 block text-lg font-extrabold">9702803911</a></div></div>
    <div className="flex gap-4"><span className="flex h-11 w-11 items-center justify-center border border-[#e5a928] text-[#a87412]"><MapPin size={19}/></span><div><p className="text-xs font-bold uppercase tracking-wider text-[#71808a]">Location</p><p className="mt-1 font-extrabold">Lahan, Siraha, Nepal</p></div></div>
    <div className="flex gap-4"><span className="flex h-11 w-11 items-center justify-center border border-[#e5a928] text-[#a87412]"><Clock3 size={19}/></span><div><p className="text-xs font-bold uppercase tracking-wider text-[#71808a]">Availability</p><p className="mt-1 font-extrabold">Please call to confirm</p></div></div>
   </div>
   <div className="mt-9 border-l-2 border-[#e5a928] bg-[#f7f9fa] p-5"><p className="text-sm font-extrabold">Need an immediate answer?</p><p className="mt-2 text-sm leading-6 text-[#637381]">Call 9702803911 to discuss urgent requirements and upcoming work.</p><a href="tel:9702803911" className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-[#94650d]">Call the rental service <Phone size={15}/></a></div>
  </aside>
  <BookingForm/>
 </div></section>
 </main>}
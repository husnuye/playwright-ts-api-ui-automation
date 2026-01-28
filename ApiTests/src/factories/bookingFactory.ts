import type { BookingPayload } from "../client/BookerClient";

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFrom<T>(arr: T[]) {
  return arr[randInt(0, arr.length - 1)];
}

function randomName() {
  const first = ["Alex", "Mia", "Noah", "Lina", "Efe", "Ada", "Leo", "Zeynep"];
  const last = ["Smith", "Brown", "Johnson", "Garcia", "Yilmaz", "Kaya", "Demir", "Celik"];
  return { firstname: randFrom(first), lastname: randFrom(last) };
}

export function buildRandomBooking(): BookingPayload {
  const { firstname, lastname } = randomName();

  const checkin = new Date();
  checkin.setDate(checkin.getDate() + randInt(1, 30));

  const checkout = new Date(checkin);
  checkout.setDate(checkout.getDate() + randInt(1, 10));

  return {
    firstname,
    lastname,
    totalprice: randInt(50, 5000),
    depositpaid: Math.random() < 0.5,
    bookingdates: {
      checkin: isoDate(checkin),
      checkout: isoDate(checkout)
    },
    additionalneeds: randFrom(["Breakfast", "Late Checkout", "None"])
  };
}
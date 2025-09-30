import Link from "next/link";


export default function Home() {
  return (
  <>
  <section className="h-screen w-full bg-purple-200 flex justify-center items-center">
    <div className="p-4 flex flex-col justify-center items-center gap-6">
      <h1 className="font-bold text-5xl">Default Page</h1>
      <Link href={
        '/calendar'
      }
      className="px-9 py-2 bg-purple-900 text-white rounded-2xl uppercase"
      >

        Go To Calendar
      </Link>
    </div>
    </section>  
  </>
  );
}

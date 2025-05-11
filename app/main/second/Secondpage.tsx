import Image from "next/image";

const Secondpage = () => {
    return ( 
    <section className="relative w-full h-screen">
        <article className="flex flex-row justify-center gap-70 mt-20">
        <div className="flex flex-col justify-center items-center gap-5">
            <span>텍스트 입력 예정</span>
            <span>텍스트 입력 예정</span>
            <span>텍스트 입력 예정</span>
            <span>텍스트 입력 예정</span>
        </div>
        <div>
        <Image
         src="/main_img1.gif"
         alt=""
         width={300}
         height={350}
         unoptimized
        />
        </div>
        </article>



    </section>
     );
}
 
export default Secondpage;
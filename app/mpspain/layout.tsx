import Menuheader from "./Menuheader";

export default function layout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <>
      <header >
        <Menuheader/>
        </header>
        <main>{children}</main>
      </>
    );
  }
  
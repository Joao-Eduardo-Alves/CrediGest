import { WppIcon } from "./Icons";

export default function WhatsAppButton({ telefone, nome, valor }) {
  const handleClick = () => {
    const formatted = telefone.replace(/\D/g, "");

    const mensagem = `Olá ${nome}, tudo bem?
Estou entrando em contato sobre seu fiado no valor de R$ ${valor}.`;

    const url = `https://wa.me/55${formatted}?text=${encodeURIComponent(mensagem)}`;

    window.open(url, "_blank");
  };

  return (
    <button className="btn-wpp" onClick={handleClick}>
      <WppIcon />
    </button>
  );
}

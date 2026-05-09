"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function Home() {

  const [grupos, setGrupos] = useState<any[]>([]);
  const [filtro, setFiltro] = useState("Todos");
  const [busca, setBusca] = useState("");

  useEffect(() => {

    async function carregarGrupos() {

      const { data, error } = await supabase
        .schema("public")
        .from("grupos")
        .select("*");

      console.log("DADOS:", data);
      console.log("ERRO:", error);

      if (data) {
        setGrupos(data);
      }

    }

    carregarGrupos();

  }, []);

  const getStatus = (membros: number) => {

    if (membros < 850) {
      return {
        texto: "Manutenção",
        cor: "bg-red-500",
        prioridade: 1,
      };
    }

    if (membros >= 950) {
      return {
        texto: "Cheio",
        cor: "bg-green-500",
        prioridade: 3,
      };
    }

    return {
      texto: "Ativo",
      cor: "bg-blue-500",
      prioridade: 2,
    };

  };

  const gruposOrdenados = [...grupos].sort(
    (a: any, b: any) =>
      getStatus(a.membros).prioridade -
      getStatus(b.membros).prioridade
  );

  const gruposFiltrados = gruposOrdenados.filter(
    (grupo: any) => {

      const status = getStatus(
        grupo.membros
      ).texto;

      const passouFiltro =
        filtro === "Todos"
          ? true
          : status === filtro;

      const passouBusca =
        grupo.nome
          .toLowerCase()
          .includes(busca.toLowerCase());

      return passouFiltro && passouBusca;

    }
  );

  return (
    <div className="min-h-screen bg-black text-white p-8">

      <h1 className="text-5xl font-bold mb-10">
        Painel de controle Grupos do WhatsApp
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

        <div className="bg-zinc-900 p-6 rounded-2xl">
          <h2 className="text-zinc-400">
            Total de grupos
          </h2>

          <p className="text-4xl font-bold">
            {grupos.length}
          </p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl">
          <h2 className="text-zinc-400">
            Total de membros
          </h2>

          <p className="text-4xl font-bold">
            {grupos.reduce(
              (acc, grupo) =>
                acc + Number(grupo.membros || 0),
              0
            )}
          </p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl">
          <h2 className="text-zinc-400">
            Grupos em manutenção
          </h2>

          <p className="text-4xl font-bold text-red-500">
            {
              grupos.filter(
                (grupo) =>
                  grupo.membros < 850
              ).length
            }
          </p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl">
          <h2 className="text-zinc-400">
            Grupos cheios
          </h2>

          <p className="text-4xl font-bold text-green-500">
            {
              grupos.filter(
                (grupo) =>
                  grupo.membros >= 950
              ).length
            }
          </p>
        </div>

      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">

        <input
          type="text"
          placeholder="🔍 Buscar grupo..."
          value={busca}
          onChange={(e) =>
            setBusca(e.target.value)
          }
          className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-xl
            px-4
            py-3
            w-full
            md:w-80
            outline-none
          "
        />

        <div className="flex gap-2 flex-wrap">

          {[
            "Todos",
            "Manutenção",
            "Ativo",
            "Cheio",
          ].map((item) => (

            <button
              key={item}
              onClick={() =>
                setFiltro(item)
              }
              className={`
                px-4 py-2 rounded-xl font-bold transition
                ${
                  filtro === item
                    ? "bg-white text-black"
                    : "bg-zinc-900 text-white"
                }
              `}
            >
              {item}
            </button>

          ))}

        </div>

      </div>

      <div className="bg-zinc-900 rounded-2xl overflow-hidden">

        <table className="w-full">

          <thead className="bg-zinc-800">
            <tr>

              <th className="text-left p-4">
                Grupo
              </th>

              <th className="text-left p-4">
                Membros
              </th>

              <th className="text-left p-4">
                Entradas
              </th>

              <th className="text-left p-4">
                Saídas
              </th>

              <th className="text-left p-4">
                Status
              </th>

            </tr>
          </thead>

          <tbody>

            {gruposFiltrados.map(
              (grupo: any) => {

                const status =
                  getStatus(grupo.membros);

                return (

                  <tr
                    key={grupo.id}
                    className="
                      border-t
                      border-zinc-800
                    "
                  >

                    <td className="p-4">
                      {grupo.nome}
                    </td>

                    <td className="p-4">
                      {grupo.membros}
                    </td>

                    <td className="
                      p-4
                      text-green-400
                      font-bold
                    ">
                      +{grupo.entrada}
                    </td>

                    <td className="
                      p-4
                      text-red-400
                      font-bold
                    ">
                      -{grupo.saida}
                    </td>

                    <td className="p-4">

                      <span
                        className={`
                          px-4
                          py-1
                          rounded-full
                          text-sm
                          font-bold
                          text-white
                          ${status.cor}
                        `}
                      >
                        {status.texto}
                      </span>

                    </td>

                  </tr>

                );

              }
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}
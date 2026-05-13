export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return Response.json(
        { error: "Método no permitido. Usa POST." },
        { status: 405 }
      );
    }

    try {
      const apiKey = process.env.OPENAI_API_KEY;

      if (!apiKey) {
        return Response.json(
          { error: "No se ha encontrado OPENAI_API_KEY en Vercel." },
          { status: 500 }
        );
      }

      const datos = await request.json();

      const prompt = `
Actúa como un asistente experto para un profesor de Educación Física de Secundaria.

Analiza los datos de una rúbrica de evaluación y redacta un informe claro, útil y prudente.

Debes devolver:
1. Un resumen general del grupo.
2. Fortalezas observadas.
3. Aspectos a mejorar.
4. Alumnado o casos que podrían requerir seguimiento, solo si los datos lo justifican.
5. Una conclusión breve para el docente.

Normas:
- No inventes información.
- Basa el análisis únicamente en los datos recibidos.
- Si hay pocos datos o están incompletos, dilo.
- Mantén un tono profesional y práctico.
- Escribe en español.

Datos de la rúbrica:
${JSON.stringify(datos, null, 2)}
`;

      const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          input: prompt
        })
      });

      const resultado = await openaiResponse.json();

      if (!openaiResponse.ok) {
        return Response.json(
          {
            error: "OpenAI ha devuelto un error.",
            detalle: resultado
          },
          { status: openaiResponse.status }
        );
      }

      const texto =
        resultado.output_text ||
        resultado.output
          ?.flatMap(item => item.content || [])
          ?.map(content => content.text || "")
          ?.join("\n")
          ?.trim() ||
        "No se ha podido generar el análisis.";

      return Response.json({ analisis: texto });
    } catch (error) {
      return Response.json(
        {
          error: "Error al analizar los datos.",
          detalle: error.message
        },
        { status: 500 }
      );
    }
  }
};

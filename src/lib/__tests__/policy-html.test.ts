import { describe, expect, it } from "vitest";
import { enhancePolicyHtml } from "@/lib/policy-html";

describe("enhancePolicyHtml", () => {
  it("promotes numbered title paragraphs to anchored h2 and drops the document title", () => {
    const html =
      "<p><strong>Política de Envíos</strong></p>" +
      "<p><strong>1. Información del responsable</strong></p>" +
      "<p>Texto de la sección.</p>" +
      "<p><strong>2. Objeto de esta política</strong></p>";

    const result = enhancePolicyHtml(html);

    expect(result).not.toContain("Política de Envíos");
    expect(result).toContain('<h2 id="1-informacion-del-responsable">');
    expect(result).toContain('<h2 id="2-objeto-de-esta-politica">');
    expect(result).toContain("<p>Texto de la sección.</p>");
  });

  it("drops the in-body update line because the page renders the real date", () => {
    const html =
      "<p><strong>Política de Envíos</strong></p>" +
      "<p><strong>Última actualización: 24 de octubre de 2026</strong></p>" +
      "<p>Resto.</p>";

    expect(enhancePolicyHtml(html)).toBe("<p>Resto.</p>");
  });

  it("keeps paragraphs that are only partially bold", () => {
    const html =
      "<p><strong>Al crear una cuenta:</strong> nombre y correo.</p>";

    expect(enhancePolicyHtml(html)).toBe(html);
  });

  it("keeps non-numbered strong-only paragraphs mid-document", () => {
    const html =
      "<p>Intro.</p>" +
      "<p><strong>Nota importante</strong></p>" +
      "<p>Fin.</p>";

    expect(enhancePolicyHtml(html)).toBe(html);
  });

  it("returns plain paragraphs unchanged", () => {
    const html = "<p>Sin formato especial.</p><p><em>Cursiva</em></p>";

    expect(enhancePolicyHtml(html)).toBe(html);
  });

  it("gives duplicate headings unique ids", () => {
    const html =
      "<p><strong>1. Contacto</strong></p><p><strong>1. Contacto</strong></p>";

    const result = enhancePolicyHtml(html);

    expect(result).toContain('id="1-contacto"');
    expect(result).toContain('id="1-contacto-2"');
  });
});

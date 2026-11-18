import type { Member } from './types';

function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function downloadBoardingPass(member: Member) {
  const code = esc(member.signCode);
  const name = esc(member.fullName);

  const html = `<!doctype html>
<html lang="mn">
<head>
<meta charset="utf-8" />
<title>Монита урилга: ${code}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #0b1526; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .pass { width: 560px; max-width: 100%; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.45); }
  .top { background: linear-gradient(120deg, #0e2a52 0%, #164a80 60%, #1e5f9e 100%); color: #fff; padding: 22px 28px; display: flex; justify-content: space-between; align-items: center; }
  .top .brand { font-size: 20px; font-weight: 800; letter-spacing: 0.5px; }
  .top .sub { font-size: 12px; color: #bcd6f2; margin-top: 3px; }
  .plane { font-size: 26px; color: #f5b93d; }
  .body { display: flex; }
  .main { flex: 1; padding: 24px 28px; }
  .lbl { font-size: 10px; letter-spacing: 1.6px; color: #7a8ba6; text-transform: uppercase; font-weight: 700; }
  .val { font-size: 18px; font-weight: 700; color: #12233f; margin: 3px 0 14px; }
  .stub { width: 150px; border-left: 2px dashed #c9d6e8; background: #f4f7fb; padding: 24px 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
  .stub .code { font-size: 24px; font-weight: 800; color: #12233f; letter-spacing: 2px; }
  .stub .name { font-size: 12px; color: #43587a; margin-top: 4px; }
  .stub .monita { margin-top: 12px; font-size: 10px; letter-spacing: 1.4px; color: #b08a1e; font-weight: 800; text-transform: uppercase; }
  .route { display: flex; align-items: center; gap: 10px; margin-top: 4px; }
  .apt { font-size: 22px; font-weight: 800; color: #12233f; }
  .line { flex: 1; height: 2px; background: linear-gradient(90deg, #c9d6e8, #f5b93d); position: relative; }
  .footer { padding: 0 28px 22px; font-size: 11px; color: #7a8ba6; display: flex; justify-content: space-between; margin-top: 10px; }
  @media print { body { background: #fff; } .pass { box-shadow: none; } }
</style>
</head>
<body>
  <div class="pass">
    <div class="top">
      <div>
        <div class="brand">MIAT · МОНИТА</div>
        <div class="sub">Мэдээлэл лавлагааны тасаг, Нууц бэлэг солилцоо</div>
      </div>
      <div class="plane">✈</div>
    </div>
    <div class="body">
      <div class="main">
        <div class="lbl">Зочин / Passenger</div>
        <div class="val">${name}</div>
        <div class="route">
          <span class="apt">БЭЛЭГ</span>
          <span class="line"></span>
          <span class="apt">МОНИТА</span>
        </div>
        <div class="lbl" style="margin-top:16px;">Таны бэлгийн буудал</div>
        <div class="val" style="font-size:14px;">Ажлын гацуур модны доор</div>
      </div>
      <div class="stub">
        <div class="lbl">Sign Code</div>
        <div class="code">${code}</div>
        <div class="name">${name}</div>
        <div class="monita">Монита 2026</div>
      </div>
    </div>
    <div class="footer">
      <span>Энэ урилгыг хадгалж үлдээнэ үү</span>
      <span>МИАТ ТӨХК, Мэдээлэл лавлагааны тасаг</span>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Monita_urilga_${member.signCode}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

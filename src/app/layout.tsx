import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/lib/i18n/messages/pt-BR.json';
import 'leaflet/dist/leaflet.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Prioridade de Visitas',
  description: 'Aplicativo de priorização de visitas para Agentes Comunitários de Saúde',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <NextIntlClientProvider locale="pt-BR" messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

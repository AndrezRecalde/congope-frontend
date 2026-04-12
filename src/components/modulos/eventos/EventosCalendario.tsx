'use client'

import { useRef, useCallback }    from 'react';
import FullCalendar               from '@fullcalendar/react';
import dayGridPlugin              from '@fullcalendar/daygrid';
import listPlugin                 from '@fullcalendar/list';
import interactionPlugin          from '@fullcalendar/interaction';
import type { EventClickArg }     from '@fullcalendar/core';

import type { Evento }            from '@/services/axios';
import {
  COLOR_TIPO_EVENTO,
} from '@/types/evento.types';

interface EventosCalendarioProps {
  eventos:         Evento[];
  onClickEvento:   (eventoId: string) => void;
  onCrearEnFecha?: (fecha: string) => void;
}

export function EventosCalendario({
  eventos,
  onClickEvento,
  onCrearEnFecha,
}: EventosCalendarioProps) {
  const calendarRef = useRef<FullCalendar>(null);

  // Convertir eventos de la API al formato FullCalendar
  // NOTA: fecha_evento viene como "DD/MM/YYYY"
  // FullCalendar necesita "YYYY-MM-DD"
  const eventosFC = eventos.map((evento) => {
    let dateFormatted = evento.fecha_evento;
    if (evento.fecha_evento?.includes('/')) {
      const [dia, mes, anio] = evento.fecha_evento.split('/');
      dateFormatted = `${anio}-${mes}-${dia}`;
    }

    return {
      id:    evento.id,
      title: evento.titulo,
      date:  dateFormatted,
      backgroundColor:
        COLOR_TIPO_EVENTO[evento.tipo_evento] ??
        '#868e96',
      borderColor:
        COLOR_TIPO_EVENTO[evento.tipo_evento] ??
        '#868e96',
      textColor: '#FFFFFF',
      extendedProps: {
        tipo_evento:         evento.tipo_evento,
        lugar:               evento.lugar,
        es_virtual:          evento.es_virtual,
        participantes_count: evento.participantes_count,
        compromisos_count:   evento.compromisos_count,
      },
    };
  });

  const handleEventClick = useCallback(
    (info: EventClickArg) => {
      onClickEvento(info.event.id);
    },
    [onClickEvento]
  );

  const handleDateClick = useCallback(
    (info: { dateStr: string }) => {
      onCrearEnFecha?.(info.dateStr);
    },
    [onCrearEnFecha]
  );

  return (
    <div style={{ height: 'calc(100vh - 280px)',
                  minHeight: 500 }}>
      <FullCalendar
        ref={calendarRef}
        plugins={[
          dayGridPlugin,
          listPlugin,
          interactionPlugin,
        ]}
        initialView="dayGridMonth"
        locale="es"
        headerToolbar={{
          left:   'prev,next today',
          center: 'title',
          right:  'dayGridMonth,listMonth',
        }}
        buttonText={{
          today:      'Hoy',
          month:      'Mes',
          list:       'Lista',
        }}
        events={eventosFC}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        eventDisplay="block"
        dayMaxEvents={3}
        moreLinkText={(n) => `+${n} más`}
        noEventsText="Sin eventos en este período"
        // Estilos integrados con el tema CONGOPE
        // definidos en src/styles/fullcalendar.css
        height="100%"
      />
    </div>
  );
}

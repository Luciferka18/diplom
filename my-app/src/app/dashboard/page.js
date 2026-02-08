const mockTrainings = [
  { id: 1, name: "Старт в фитнесе", progress: 45 },
  { id: 2, name: "Сушка и рельеф", progress: 10 },
];

const mockOrders = [
  { id: 101, date: "12.01.2026", total: 3490, status: "Доставлен" },
  { id: 102, date: "28.01.2026", total: 1990, status: "В пути" },
];

const mockSubscriptions = [
  { id: 1, name: "Онлайн-доступ к программам", status: "Активна" },
];

export default function DashboardPage() {
  return (
    <div className="py-10">
      <div className="container-fitlab grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold mb-1">Привет, атлет!</h1>
              <p className="text-sm text-black/60">
                Здесь ты видишь свои тренировки, заказы и подписки.
              </p>
            </div>
            <span className="badge">Администратор</span>
          </div>

          <div className="card">
            <h2 className="font-semibold mb-3 text-sm">Мои тренировки</h2>
            <div className="space-y-3">
              {mockTrainings.map((t) => (
                <div key={t.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{t.name}</span>
                    <span>{t.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-black/5 overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-primary)]"
                      style={{ width: `${t.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold mb-3 text-sm">Мои заказы</h2>
            <div className="space-y-2 text-xs">
              {mockOrders.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between border-b border-black/5 pb-2 last:border-none last:pb-0"
                >
                  <div>
                    <div className="font-medium">Заказ #{o.id}</div>
                    <div className="text-black/60">{o.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {o.total.toLocaleString("ru-RU", {
                        style: "currency",
                        currency: "RUB",
                        maximumFractionDigits: 0,
                      })}
                    </div>
                    <div className="text-black/60">{o.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="card">
            <h2 className="font-semibold mb-3 text-sm">Подписки</h2>
            <div className="space-y-2 text-xs">
              {mockSubscriptions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between border-b border-black/5 pb-2 last:border-none last:pb-0"
                >
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-black/60">{s.status}</div>
                  </div>
                  <button className="btn-outline text-[11px] px-3 py-1">
                    Управлять
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold mb-3 text-sm">Админ-панель</h2>
            <p className="text-xs text-black/60 mb-3">
              Здесь в будущем можно будет управлять программами тренировок,
              товарами магазина и статьями блога.
            </p>
            <div className="grid gap-2 text-xs">
              <a href="/dashboard/programs" className="btn-outline w-full">
                Управление программами
              </a>
              <a href="/dashboard/products" className="btn-outline w-full">
                Управление товарами
              </a>
              <a href="/dashboard/articles" className="btn-outline w-full">
                Управление статьями
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}


import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import dbConnect from "@/lib/mongodb"
import Player, { type IPlayer } from "@/models/player-model"
import { getAppConfig } from "@/models/config-model"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import AddAuthorizedCpfForm from "@/components/add-authorized-cpf-form"
import ConfigMensalidadeForm from "@/components/config-mensalidade-form"
import LogsTable from "@/components/logs-table"
import { removeAuthorizedCpfAction } from "./actions"
import { ROLES } from "@/lib/roles"

// Server component to display list and handle remove action via a form
async function AuthorizedCpfList() {
  await dbConnect()
  const authorizedPlayers = (await Player.find({ isAuthorized: true }).sort({ createdAt: -1 }).lean()) as IPlayer[]

  return (
    <Card>
      <CardHeader>
        <CardTitle>CPFs Autorizados e Status de Cadastro</CardTitle>
        <CardDescription>Lista de CPFs com permissão de acesso e seu status no sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CPF</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Status Cadastro</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Autorizado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {authorizedPlayers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Nenhum CPF autorizado encontrado.
                  </TableCell>
                </TableRow>
              )}
              {authorizedPlayers.map((player) => (
                <TableRow key={player.cpf}>
                  <TableCell>{player.cpf}</TableCell>
                  <TableCell>{player.nome}</TableCell>
                  <TableCell>
                    <Badge
                      variant={player.registrationCompleted ? "default" : "secondary"}
                      className={player.registrationCompleted ? "bg-green-500 text-white" : "bg-yellow-400 text-black"}
                    >
                      {player.registrationCompleted
                        ? "Completo"
                        : player.status === "autorizado_nao_cadastrado"
                          ? "Pendente"
                          : player.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{player.role}</TableCell>
                  <TableCell>{player.createdAt ? new Date(player.createdAt).toLocaleDateString("pt-BR") : ""}</TableCell>
                  <TableCell>
                    {!player.registrationCompleted && (
                      <form action={async (formData: FormData) => {
                        const cpf = formData.get("cpf") as string
                        await removeAuthorizedCpfAction(cpf)
                      }}>
                        <input type="hidden" name="cpf" value={player.cpf} />
                        <Button variant="destructive" size="sm" type="submit" title="Remover Autorização">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default async function AdminDashboardPage() {
  const session = await getSession()

  if (!session || session.role !== ROLES.ADMIN) {
    redirect("/login")
  }

  const config = await getAppConfig() // Fetch current config for mensalidade

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-primary">Painel Administrativo AFPS</h1>
      <Tabs defaultValue="cpfs" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-4">
          <TabsTrigger value="jogadores">Jogadores</TabsTrigger>
          <TabsTrigger value="cpfs">Perfis e Acesso</TabsTrigger>
          <TabsTrigger value="mensalidade">Mensalidade</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
        </TabsList>

        <TabsContent value="jogadores">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Jogadores</CardTitle>
              <CardDescription>Funcionalidades para gerenciar dados e estatísticas dos jogadores.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">🚧 Em desenvolvimento: Tabela de jogadores, formulários de edição, etc.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="cpfs">
          <AddAuthorizedCpfForm />
          <div className="mt-6">
            <AuthorizedCpfList />
          </div>
        </TabsContent>
        <TabsContent value="mensalidade">
          <ConfigMensalidadeForm currentValor={config.valorMensalidade} />
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Logs e Auditoria</CardTitle>
              <CardDescription>Visualizar logs de atividades importantes do sistema.</CardDescription>
            </CardHeader>
            <CardContent>
              <LogsTable />
              {/* Placeholder for <FiltroLogs /> */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="despesas">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Despesas da Comissão</CardTitle>
              <CardDescription>Adicionar, editar e visualizar despesas. Gerar relatórios financeiros.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">🚧 Em desenvolvimento: Formulário de despesa, tabela e gráficos.</p>
              {/* Placeholder for <FormularioDespesa />, <TabelaDespesas />, <GraficoDespesasMensais /> */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

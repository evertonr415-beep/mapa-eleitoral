(function(){
  const wait=setInterval(()=>{
    const svc=window.SupabaseService;
    if(!svc||typeof svc.registerVereador!=='function')return;
    clearInterval(wait);
    if(svc.__managedSignupPatched)return;
    svc.__managedSignupPatched=true;

    svc.registerVereador=async function(formData){
      await this.remoteReady;
      if(!this.client) throw new Error('Nao foi possivel conectar ao Supabase.');

      const current=this.getCurrentUser&&this.getCurrentUser();
      if(!current||!['master','adm'].includes(current.role)) throw new Error('Apenas Master ou Adm pode cadastrar vereador.');

      const rawEmail=String(formData&&formData.email||'').trim().toLowerCase();
      const email=rawEmail.includes('@')?rawEmail:rawEmail+'@campanha.com.br';
      const password=String(formData&&formData.senha||'');
      if(!email||!email.includes('@')) throw new Error('Informe um e-mail valido.');
      if(password.length<8) throw new Error('A senha deve ter no minimo 8 caracteres.');

      const metadata={
        nome:String(formData&&formData.nome||'').trim(),
        whatsapp:String(formData&&formData.whatsapp||'').replace(/\D/g,''),
        cpf:String(formData&&formData.cpf||'').replace(/\D/g,''),
        partido:String(formData&&formData.partido||'Independente'),
        numeroCandidato:String(formData&&formData.numeroCandidato||''),
        cargo:String(formData&&formData.cargo||'Vereador')
      };

      const {data,error}=await this.client.auth.signUp({
        email,
        password,
        options:{data:metadata}
      });
      if(error) throw new Error(error.message);
      if(!data||!data.user) throw new Error('Nao foi possivel criar o usuario.');

      const {error:confirmError}=await this.client.rpc('confirm_managed_signup',{target_user_id:data.user.id});
      if(confirmError) throw new Error('Conta criada, mas nao foi possivel confirmar automaticamente: '+confirmError.message);

      if(this.refreshRemoteCache) await this.refreshRemoteCache();
      return {
        user:{
          id:data.user.id,
          nome:metadata.nome||email.split('@')[0],
          email,
          whatsapp:metadata.whatsapp,
          cpf:metadata.cpf,
          partido:metadata.partido,
          numeroCandidato:metadata.numeroCandidato,
          cargo:metadata.cargo,
          role:'vereador',
          avatar:'🗳️',
          ativo:true
        },
        emailResult:{success:true,email,pendingConfirmation:false,autoConfirmed:true}
      };
    };
  },50);
  setTimeout(()=>clearInterval(wait),15000);
})();

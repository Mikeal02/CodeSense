import { motion } from "framer-motion";
import { Code2, Github, Twitter, Heart } from "lucide-react";

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="py-16 border-t border-border/50"
    >
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Code2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold font-display">CodeSense</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Turn confusion into confidence. Understand your code, ace your interviews, 
              and ship with clarity.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground transition-colors cursor-pointer">AI Code Analysis</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">Interview Preparation</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">Dependency Graphs</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">Code Metrics</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">File Comparison</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground transition-colors cursor-pointer">Documentation</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">Keyboard Shortcuts</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">Privacy Policy</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">Changelog</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-destructive" /> by developers, for developers
          </p>
          
          <div className="flex items-center gap-4">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
